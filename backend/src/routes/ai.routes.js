const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { chatSchema } = require('../validators/ai.validator');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

router.use(requireAuth, requireRole('manager'));

router.post('/chat', validate(chatSchema), aiController.chat);
router.get('/conversations', aiController.listConversations);
router.get('/conversations/:id', aiController.getConversation);
router.delete('/conversations/:id', aiController.deleteConversation);

module.exports = router;
