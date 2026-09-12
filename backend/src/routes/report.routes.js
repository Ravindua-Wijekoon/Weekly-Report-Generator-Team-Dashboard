const express = require('express');

const { requireAuth } = require('../middleware/auth');
const {
  loadReport,
  requireReportOwner,
  requireReportOwnerOrManager,
  requireRole,
} = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  createReportSchema,
  updateReportSchema,
  reviewActionSchema,
} = require('../validators/report.validator');
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
router.post('/:id/submit', loadReport, requireReportOwner, reportController.submit);
router.post(
  '/:id/review',
  validate(reviewActionSchema),
  requireRole('manager'),
  loadReport,
  reportController.review
);
router.get('/:id/versions', loadReport, requireReportOwnerOrManager, reportController.getVersions);

module.exports = router;
