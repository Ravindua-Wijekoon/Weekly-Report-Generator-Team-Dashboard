const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { requireRole, requireSelfOrManager } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema } = require('../validators/user.validator');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', requireRole('manager'), userController.list);
router.post('/', requireRole('manager'), validate(createUserSchema), userController.create);
router.get('/:id', requireSelfOrManager, userController.getOne);
router.patch('/:id', requireRole('manager'), validate(updateUserSchema), userController.update);

module.exports = router;
