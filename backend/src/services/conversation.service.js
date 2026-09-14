const Conversation = require('../models/Conversation');

function buildTitle(message) {
  const trimmed = message.trim();
  return trimmed.length > 60 ? `${trimmed.slice(0, 57).trimEnd()}...` : trimmed;
}

async function listConversations(ownerId) {
  return Conversation.find({ owner: ownerId }).select('title createdAt updatedAt').sort('-updatedAt');
}

async function getConversation(id, ownerId) {
  const conversation = await Conversation.findOne({ _id: id, owner: ownerId });
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.status = 404;
    throw error;
  }
  return conversation;
}

async function loadOrCreate(conversationId, ownerId, message) {
  if (conversationId) {
    return getConversation(conversationId, ownerId);
  }
  return Conversation.create({ owner: ownerId, title: buildTitle(message), messages: [] });
}

async function deleteConversation(id, ownerId) {
  const result = await Conversation.deleteOne({ _id: id, owner: ownerId });
  if (result.deletedCount === 0) {
    const error = new Error('Conversation not found');
    error.status = 404;
    throw error;
  }
}

module.exports = { listConversations, getConversation, loadOrCreate, deleteConversation };
