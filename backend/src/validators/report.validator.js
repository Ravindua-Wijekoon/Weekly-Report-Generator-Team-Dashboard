const { z } = require('zod');

const { objectId } = require('./common');

const taskItemSchema = z.object({
  name: z.string().trim().min(1, 'Task name is required'),
  priority: z.enum(['low', 'medium', 'high']),
  plannedPercent: z.number().min(0).max(100).default(0),
  actualPercent: z.number().min(0).max(100).default(0),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']),
  timePlannedHours: z.number().min(0).default(0),
  timeSpentHours: z.number().min(0).default(0),
  output: z.string().trim().optional(),
});

const listItemSchema = z.object({
  text: z.string().trim().min(1, 'Text is required'),
  isKey: z.boolean().optional().default(false),
});

const hoursByTypeSchema = z.object({
  development: z.number().min(0).optional(),
  testing: z.number().min(0).optional(),
  meetings: z.number().min(0).optional(),
  documentation: z.number().min(0).optional(),
  other: z.number().min(0).optional(),
});

const reportContentSchema = z.object({
  tasksCompleted: z.array(taskItemSchema).default([]),
  tasksPlannedNextWeek: z.array(z.object({ text: z.string().trim().min(1) })).default([]),
  blockers: z.array(listItemSchema).default([]),
  achievements: z.array(listItemSchema).default([]),
  hoursByType: hoursByTypeSchema.optional(),
  notes: z.string().trim().optional(),
});

const createReportSchema = z.object({
  project: objectId,
  weekStart: z.string().optional(),
});

const updateReportSchema = z.object({
  project: objectId.optional(),
  content: reportContentSchema.optional(),
});

const reviewActionSchema = z
  .object({
    action: z.enum(['approve', 'request_changes']),
    comment: z.string().trim().optional(),
  })
  .refine((data) => data.action !== 'request_changes' || Boolean(data.comment), {
    message: 'A comment is required when requesting changes',
    path: ['comment'],
  });

module.exports = { createReportSchema, updateReportSchema, reviewActionSchema, reportContentSchema };
