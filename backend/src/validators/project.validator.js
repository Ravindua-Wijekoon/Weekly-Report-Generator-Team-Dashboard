const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createProjectSchema, updateProjectSchema };
