const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(requireAuth, requireRole('manager'));

router.get('/summary', dashboardController.summary);
router.get('/trend', dashboardController.trend);
router.get('/status-by-member', dashboardController.statusByMember);
router.get('/workload-by-project', dashboardController.workloadByProject);
router.get('/hours-by-type', dashboardController.hoursByType);
router.get('/activity', dashboardController.activity);
router.get('/section', dashboardController.section);

module.exports = router;
