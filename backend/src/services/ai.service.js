const { GoogleGenAI, FunctionCallingConfigMode } = require('@google/genai');

const env = require('../config/env');
const User = require('../models/User');
const reportService = require('./report.service');
const dashboardService = require('./dashboard.service');
const conversationService = require('./conversation.service');

const MODEL = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `You are the team assistant inside a Weekly Report Generator and Team Dashboard app.
You answer a manager's questions about their team's weekly reports using the tools provided.
Always call a tool to look up real data before answering questions about team activity, never guess.
When a question refers to a team member by name, call findMember first to resolve their id.
If findMember returns more than one match, do not guess: list each match's full name (and email if
two names look the same) and ask the manager which one they meant, do not call any other tool until
they answer.
Weeks are identified by any date inside them (default to today when the manager does not name a week).
Keep answers concise and specific, citing task names, statuses, or numbers from the tool results.`;

let client = null;
function getClient() {
  if (!env.geminiApiKey) {
    return null;
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return client;
}

const functionDeclarations = [
  {
    name: 'findMember',
    description: 'Find a team member (role member) by name to resolve their id for other tools.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full or partial name of the team member' },
      },
      required: ['name'],
    },
  },
  {
    name: 'getWeekSummary',
    description: 'Get submission compliance counts (submitted, pending, late) and open blocker counts for a week.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'Any ISO date inside the target week, e.g. 2026-09-08. Omit for the current week.' },
      },
    },
  },
  {
    name: 'getStatusByMember',
    description: 'Get each team member\'s report status (draft, submitted, needs_correction, approved) for a week.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'Any ISO date inside the target week. Omit for the current week.' },
      },
    },
  },
  {
    name: 'getTeamActivity',
    description: 'Get the most recent review activity across the team (approvals and change requests, with reviewer comments).',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of activity entries to return, default 20' },
      },
    },
  },
  {
    name: 'getMemberReports',
    description: 'Get a specific team member\'s recent weekly reports, including tasks completed, blockers, and achievements. Use findMember first to get the memberId.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'The member\'s user id, from findMember' },
        weeks: { type: 'number', description: 'How many recent weeks of reports to return, default 4' },
      },
      required: ['memberId'],
    },
  },
  {
    name: 'getWorkloadByProject',
    description: 'Get task count and total hours logged per project for a week.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'Any ISO date inside the target week. Omit for the current week.' },
      },
    },
  },
  {
    name: 'getTeamSection',
    description: 'Get every team member\'s blockers or achievements for a week, grouped by member and project.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        weekStart: { type: 'string', description: 'Any ISO date inside the target week. Omit for the current week.' },
        section: { type: 'string', enum: ['blockers', 'achievements'] },
      },
      required: ['section'],
    },
  },
];

async function findMember({ name }) {
  const members = await User.find({
    role: 'member',
    isActive: true,
    name: { $regex: name, $options: 'i' },
  }).select('_id name email');

  return { members: members.map((member) => ({ id: member._id.toString(), name: member.name, email: member.email })) };
}

async function getWeekSummary({ weekStart }) {
  return dashboardService.getSummary(weekStart);
}

async function getStatusByMember({ weekStart }) {
  const members = await dashboardService.getStatusByMember(weekStart);
  return { members };
}

async function getTeamActivity({ limit }) {
  const activity = await dashboardService.getActivity(limit);
  return { activity };
}

async function getWorkloadByProject({ weekStart }) {
  const projects = await dashboardService.getWorkloadByProject(weekStart);
  return { projects };
}

async function getTeamSection({ weekStart, section }) {
  const results = await dashboardService.getSection(weekStart, section);
  return { results };
}

function makeGetMemberReports(managerId) {
  return async function getMemberReports({ memberId, weeks }) {
    const { data } = await reportService.listReports({
      owner: memberId,
      limit: weeks || 4,
      sort: '-weekStart',
      requesterId: managerId,
      requesterRole: 'manager',
    });

    return {
      reports: data.map((report) => ({
        id: report._id.toString(),
        ownerName: report.owner?.name,
        weekLabel: report.weekLabel,
        project: report.project?.name,
        status: report.status,
        tasksCompleted: report.content.tasksCompleted.map((task) => ({
          name: task.name,
          status: task.status,
          output: task.output,
        })),
        tasksPlannedNextWeek: (report.content.tasksPlannedNextWeek || []).map((item) => item.task),
        blockers: report.content.blockers.map((item) => item.text),
        achievements: report.content.achievements.map((item) => item.text),
      })),
    };
  };
}

function buildToolMap(managerId) {
  return {
    findMember,
    getWeekSummary,
    getStatusByMember,
    getTeamActivity,
    getWorkloadByProject,
    getTeamSection,
    getMemberReports: makeGetMemberReports(managerId),
  };
}

function toParts(message) {
  return [{ text: message }];
}

// The Gemini SDK's ApiError carries the upstream HTTP status plus a raw JSON
// error body as its message. Both leak straight past our errorHandler as a
// "safe to show" error, so translate them into a clean message here instead.
function toFriendlyGeminiError(err) {
  const status = typeof err.status === 'number' ? err.status : null;
  if (!status) {
    return err;
  }

  const friendly = new Error(
    status === 429
      ? 'The AI assistant has reached its usage limit for now. Please try again in a minute.'
      : 'The AI assistant is temporarily unavailable. Please try again shortly.'
  );
  friendly.status = status === 429 ? 429 : 502;
  return friendly;
}

async function chat({ message, conversationId, managerId }) {
  const ai = getClient();
  if (!ai) {
    const error = new Error('AI assistant is not configured');
    error.status = 503;
    throw error;
  }

  const conversation = await conversationService.loadOrCreate(conversationId, managerId, message);

  const tools = buildToolMap(managerId);
  const contents = [
    ...conversation.messages.map((turn) => ({ role: turn.role, parts: toParts(turn.text) })),
    { role: 'user', parts: toParts(message) },
  ];

  const sources = [];
  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [{ functionDeclarations }],
    toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
    thinkingConfig: { thinkingLevel: 'low' },
  };

  const MAX_TURNS = 6;
  for (let turn = 0; turn < MAX_TURNS; turn += 1) {
    let response;
    try {
      response = await ai.models.generateContent({ model: MODEL, contents, config });
    } catch (err) {
      throw toFriendlyGeminiError(err);
    }
    const calls = response.functionCalls;

    if (!calls || calls.length === 0) {
      const uniqueSources = Array.from(new Map(sources.map((source) => [source.id, source])).values());
      const reply = response.text || '';
      conversation.messages.push({ role: 'user', text: message });
      conversation.messages.push({ role: 'model', text: reply, sources: uniqueSources });
      await conversation.save();
      return { conversationId: conversation._id.toString(), reply, sources: uniqueSources };
    }

    // Push the model's turn exactly as returned (not reconstructed from response.functionCalls),
    // since Gemini 3 attaches a thoughtSignature to each function-call part that must be echoed
    // back verbatim on the next turn or the API rejects the request.
    contents.push(response.candidates[0].content);

    const responseParts = [];
    for (const call of calls) {
      const fn = tools[call.name];
      let output;
      try {
        output = fn ? await fn(call.args || {}) : { error: `Unknown tool: ${call.name}` };
      } catch (err) {
        output = { error: err.message };
      }
      if (Array.isArray(output?.reports)) {
        for (const report of output.reports) {
          sources.push({
            id: report.id,
            label: `${report.ownerName || 'Report'} - Week ${report.weekLabel}`,
          });
        }
      }
      responseParts.push({ functionResponse: { name: call.name, response: output } });
    }

    contents.push({ role: 'user', parts: responseParts });
  }

  const error = new Error('Assistant could not complete the request');
  error.status = 502;
  throw error;
}

module.exports = { chat };
