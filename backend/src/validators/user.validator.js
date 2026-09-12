const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['member', 'manager']).default('member'),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.enum(['member', 'manager']).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createUserSchema, updateUserSchema };
