require('dotenv').config();

const mongoose = require('mongoose');

const env = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Report = require('../src/models/Report');
const authService = require('../src/services/auth.service');
const reportService = require('../src/services/report.service');

const PASSWORD = 'password123';

const MEMBER_SEEDS = [
  { name: 'Riya Perera', email: 'riya@example.com' },
  { name: 'Kasun Silva', email: 'kasun@example.com' },
  { name: 'Nadia Fernando', email: 'nadia@example.com' },
  { name: 'Dilan Jayasuriya', email: 'dilan@example.com' },
  { name: 'Chamodi Rathnayake', email: 'chamodi@example.com' },
];

const PROJECT_SEEDS = ['Client A', 'Internal Tooling', 'R&D', 'Marketing'];

const TASK_NAMES = [
  'Implement login flow',
  'Fix pagination bug',
  'Write unit tests',
  'Refactor API client',
  'Design dashboard mockups',
  'Update documentation',
  'Client meeting prep',
  'Code review',
  'Deploy staging build',
  'Investigate performance issue',
];
const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['not_started', 'in_progress', 'completed', 'blocked'];
const BLOCKER_TEXTS = [
  'Waiting on API access',
  'Blocked by design review',
  'Unclear requirements from client',
  'Environment setup issues',
  'Dependency on another team',
];
const ACHIEVEMENT_TEXTS = [
  'Shipped the new login page',
  'Reduced load time by 30%',
  'Closed 5 bugs this week',
  'Completed onboarding docs',
  'Positive client feedback on demo',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildContent() {
  const tasksCompleted = Array.from({ length: randomInt(2, 4) }, () => {
    const planned = randomInt(50, 100);
    return {
      name: pick(TASK_NAMES),
      priority: pick(PRIORITIES),
      plannedPercent: planned,
      actualPercent: Math.min(100, Math.max(0, planned + randomInt(-20, 10))),
      status: pick(STATUSES),
      timePlannedHours: randomInt(2, 12),
      timeSpentHours: randomInt(2, 14),
      output: 'Delivered as part of weekly work',
    };
  });

  const tasksPlannedNextWeek = Array.from({ length: randomInt(1, 3) }, () => ({
    task: pick(TASK_NAMES),
    description: 'Continue building on this week\'s progress.',
  }));

  const blockers = Array.from({ length: randomInt(1, 2) }, (_, i) => ({
    text: pick(BLOCKER_TEXTS),
    isKey: i === 0 && Math.random() > 0.4,
  }));

  const achievements = Array.from({ length: randomInt(1, 2) }, (_, i) => ({
    text: pick(ACHIEVEMENT_TEXTS),
    isKey: i === 0 && Math.random() > 0.4,
  }));

  const hoursByType =
    Math.random() > 0.3
      ? {
          development: randomInt(10, 25),
          testing: randomInt(1, 6),
          meetings: randomInt(1, 5),
          documentation: randomInt(0, 4),
          other: randomInt(0, 2),
        }
      : {};

  const notes = Math.random() > 0.7 ? 'No additional notes this week.' : '';

  return { tasksCompleted, tasksPlannedNextWeek, blockers, achievements, hoursByType, notes };
}

function withFollowUpTask(content) {
  return {
    ...content,
    tasksCompleted: [
      ...content.tasksCompleted,
      {
        name: 'Address reviewer feedback',
        priority: 'high',
        plannedPercent: 100,
        actualPercent: 100,
        status: 'completed',
        timePlannedHours: 2,
        timeSpentHours: 3,
        output: 'Updated based on manager comments',
      },
    ],
    notes: 'Updated after manager feedback.',
  };
}

async function runScenario(scenario, { ownerId, projectId, weekDate, managerId }) {
  if (scenario === 'none') {
    return;
  }

  const report = await reportService.createDraft({ owner: ownerId, project: projectId, weekStart: weekDate });
  report.content = buildContent();
  await report.save();

  if (scenario === 'draft') {
    return;
  }

  await reportService.submitReport(report);

  if (scenario === 'submitted') {
    return;
  }

  if (scenario === 'approved_first_try') {
    await reportService.reviewReport(report, managerId, { action: 'approve' });
    return;
  }

  if (scenario === 'needs_correction_once') {
    await reportService.reviewReport(report, managerId, {
      action: 'request_changes',
      comment: 'Please add more detail on the tasks completed this week.',
    });
    return;
  }

  if (scenario === 'approved_after_correction') {
    await reportService.reviewReport(report, managerId, {
      action: 'request_changes',
      comment: 'Can you break down the hours spent per task type?',
    });
    await reportService.updateContent(report, { content: withFollowUpTask(report.content.toObject()) });
    await reportService.submitReport(report);
    await reportService.reviewReport(report, managerId, { action: 'approve' });
    return;
  }

  if (scenario === 'needs_correction_twice') {
    await reportService.reviewReport(report, managerId, {
      action: 'request_changes',
      comment: 'This is missing the blockers section, please fill it in.',
    });
    await reportService.updateContent(report, { content: withFollowUpTask(report.content.toObject()) });
    await reportService.submitReport(report);
    await reportService.reviewReport(report, managerId, {
      action: 'request_changes',
      comment: 'Better, but the achievements still need a key highlight flagged.',
    });
  }
}

const ROTATION = [
  'approved_first_try',
  'approved_after_correction',
  'needs_correction_once',
  'draft',
  'none',
  'approved_first_try',
];

const CURRENT_WEEK_OVERRIDE = ['submitted', 'submitted', 'draft', 'needs_correction_once', 'none'];

function pickScenario(memberIndex, weekIndex, totalWeeks) {
  if (weekIndex === totalWeeks - 1) {
    return CURRENT_WEEK_OVERRIDE[memberIndex];
  }
  if (memberIndex === 2 && weekIndex === 3) {
    return 'needs_correction_twice';
  }
  return ROTATION[(weekIndex + memberIndex) % ROTATION.length];
}

async function seed() {
  if (env.nodeEnv === 'production') {
    throw new Error('Refusing to run the seed script against a production environment');
  }

  await connectDB(env.mongoUri);

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);

  const managerPasswordHash = await authService.hashPassword(PASSWORD);
  const manager = await User.create({
    name: 'Alex Manager',
    email: 'manager@example.com',
    passwordHash: managerPasswordHash,
    role: 'manager',
  });

  const memberPasswordHash = await authService.hashPassword(PASSWORD);
  const members = await User.insertMany(
    MEMBER_SEEDS.map((member) => ({
      name: member.name,
      email: member.email,
      passwordHash: memberPasswordHash,
      role: 'member',
    }))
  );

  const projects = await Project.insertMany(
    PROJECT_SEEDS.map((name) => ({ name, description: `${name} engagement`, createdBy: manager._id }))
  );

  const totalWeeks = 6;
  const now = new Date();

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex += 1) {
    const weeksAgo = totalWeeks - 1 - weekIndex;
    const weekDate = new Date(now);
    weekDate.setUTCDate(weekDate.getUTCDate() - weeksAgo * 7);

    for (let memberIndex = 0; memberIndex < members.length; memberIndex += 1) {
      const scenario = pickScenario(memberIndex, weekIndex, totalWeeks);
      const project = projects[(memberIndex + weekIndex) % projects.length];

      await runScenario(scenario, {
        ownerId: members[memberIndex]._id,
        projectId: project._id,
        weekDate,
        managerId: manager._id,
      });
    }
  }

  console.log('Seed complete.');
  console.log('');
  console.log('Manager login:');
  console.log(`  ${manager.email} / ${PASSWORD}`);
  console.log('');
  console.log('Member logins:');
  members.forEach((member) => console.log(`  ${member.email} / ${PASSWORD}`));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
