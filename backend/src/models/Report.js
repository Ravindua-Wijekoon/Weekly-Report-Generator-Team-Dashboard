const mongoose = require('mongoose');

const { Schema } = mongoose;

const TaskItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
    plannedPercent: { type: Number, min: 0, max: 100, default: 0 },
    actualPercent: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'blocked'],
      required: true,
    },
    timePlannedHours: { type: Number, min: 0, default: 0 },
    timeSpentHours: { type: Number, min: 0, default: 0 },
    output: { type: String, trim: true },
  },
  { _id: true }
);

const ListItemSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    isKey: { type: Boolean, default: false },
  },
  { _id: true }
);

const HoursByTypeSchema = new Schema(
  {
    development: { type: Number, min: 0, default: 0 },
    testing: { type: Number, min: 0, default: 0 },
    meetings: { type: Number, min: 0, default: 0 },
    documentation: { type: Number, min: 0, default: 0 },
    other: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const ReportContentSchema = new Schema(
  {
    tasksCompleted: { type: [TaskItemSchema], default: [] },
    tasksPlannedNextWeek: { type: [{ text: String }], default: [] },
    blockers: { type: [ListItemSchema], default: [] },
    achievements: { type: [ListItemSchema], default: [] },
    hoursByType: { type: HoursByTypeSchema, default: () => ({}) },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const ReportVersionSchema = new Schema(
  {
    versionNumber: { type: Number, required: true },
    content: { type: ReportContentSchema, required: true },
    savedAt: { type: Date, default: Date.now },
    reviewedCommentIds: [{ type: Schema.Types.ObjectId }],
  },
  { _id: true }
);

const ReviewCommentSchema = new Schema(
  {
    action: { type: String, enum: ['requested_changes', 'approved'], required: true },
    comment: { type: String, trim: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetVersionNumber: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ReportSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },

    weekStart: { type: Date, required: true, index: true },
    weekEnd: { type: Date, required: true },
    weekLabel: { type: String, required: true },

    content: { type: ReportContentSchema, required: true, default: () => ({}) },

    currentVersionNumber: { type: Number, required: true, default: 1 },

    status: {
      type: String,
      enum: ['draft', 'submitted', 'needs_correction', 'approved'],
      default: 'draft',
      required: true,
      index: true,
    },

    submittedAt: { type: Date },
    approvedAt: { type: Date },

    versions: { type: [ReportVersionSchema], default: [] },
    reviewComments: { type: [ReviewCommentSchema], default: [] },

    latestComment: {
      action: String,
      comment: String,
      reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: Date,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ owner: 1, weekLabel: 1 }, { unique: true });
ReportSchema.index({ project: 1, weekStart: 1 });
ReportSchema.index({ status: 1, weekStart: 1 });

module.exports = mongoose.model('Report', ReportSchema);
