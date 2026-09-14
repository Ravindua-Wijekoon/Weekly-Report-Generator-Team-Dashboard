const { z } = require('zod');

const { objectId } = require('./common');

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
  conversationId: objectId.nullish(),
});

module.exports = { chatSchema };
