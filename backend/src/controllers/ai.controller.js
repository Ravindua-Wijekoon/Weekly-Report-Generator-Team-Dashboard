const aiService = require('../services/ai.service');
const conversationService = require('../services/conversation.service');

async function chat(req, res) {
  const { message, conversationId } = req.body;
  const result = await aiService.chat({ message, conversationId, managerId: req.user.id });
  res.json(result);
}

async function listConversations(req, res) {
  const data = await conversationService.listConversations(req.user.id);
  res.json({ data });
}

async function getConversation(req, res) {
  const conversation = await conversationService.getConversation(req.params.id, req.user.id);
  res.json(conversation);
}

async function deleteConversation(req, res) {
  await conversationService.deleteConversation(req.params.id, req.user.id);
  res.status(204).send();
}

module.exports = { chat, listConversations, getConversation, deleteConversation };
