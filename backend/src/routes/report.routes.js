const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { loadReport, requireReportOwner, requireReportOwnerOrManager } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createReportSchema, updateReportSchema } = require('../validators/report.validator');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', reportController.list);
router.post('/', validate(createReportSchema), reportController.create);
router.get('/:id', loadReport, requireReportOwnerOrManager, reportController.getOne);
router.patch(
  '/:id',
  validate(updateReportSchema),
  loadReport,
  requireReportOwner,
  reportController.update
);

module.exports = router;
