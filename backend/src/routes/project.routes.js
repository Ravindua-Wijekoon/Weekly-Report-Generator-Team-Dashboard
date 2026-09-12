const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createProjectSchema, updateProjectSchema } = require('../validators/project.validator');
const projectController = require('../controllers/project.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', projectController.list);
router.post('/', requireRole('manager'), validate(createProjectSchema), projectController.create);
router.patch('/:id', requireRole('manager'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', requireRole('manager'), projectController.remove);

module.exports = router;
