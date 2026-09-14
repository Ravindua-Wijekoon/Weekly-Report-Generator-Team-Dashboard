const { z } = require('zod');

const { objectId } = require('./common');

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  members: z.array(objectId).optional().default([]),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  members: z.array(objectId).optional(),
});

module.exports = { createProjectSchema, updateProjectSchema };
