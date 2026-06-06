const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');

// KPI Summary
router.get('/kpi', DashboardController.getKPISummary);

// Sales Trend
router.get('/trend', DashboardController.getSalesTrend);

// Category Breakdown
router.get('/categories', DashboardController.getCategoryBreakdown);

// Region Analysis
router.get('/regions', DashboardController.getRegionAnalysis);

// Top Products
router.get('/top-products', DashboardController.getTopProducts);

// Raw Data
router.get('/raw-data', DashboardController.getRawData);

// Filter Options
router.get('/filters', DashboardController.getFilterOptions);

// Insights
router.get('/insights', DashboardController.getInsights);

// Export CSV
router.get('/export/csv', DashboardController.exportCSV);

module.exports = router;
