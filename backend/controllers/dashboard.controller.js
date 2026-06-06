const DashboardModel = require('../models/dashboard.model');

class DashboardController {
  /**
   * Get KPI Summary
   */
  static async getKPISummary(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region
      };

      const data = await DashboardModel.getKPISummary(filters);
      
      res.json({
        success: true,
        data: {
          totalSales: parseFloat(data.total_sales),
          totalProfit: parseFloat(data.total_profit),
          totalOrders: parseInt(data.total_orders),
          averageOrderValue: parseFloat(data.average_order_value)
        }
      });
    } catch (error) {
      console.error('Error in getKPISummary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch KPI summary',
        error: error.message
      });
    }
  }

  /**
   * Get Sales Trend
   */
  static async getSalesTrend(req, res) {
    try {
      const period = req.query.period || 'daily';
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region
      };

      const data = await DashboardModel.getSalesTrend(period, filters);
      
      res.json({
        success: true,
        data: data.map(item => ({
          period: item.period,
          orders: parseInt(item.orders),
          sales: parseFloat(item.sales),
          profit: parseFloat(item.profit)
        }))
      });
    } catch (error) {
      console.error('Error in getSalesTrend:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales trend',
        error: error.message
      });
    }
  }

  /**
   * Get Category Breakdown
   */
  static async getCategoryBreakdown(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        region: req.query.region
      };

      const data = await DashboardModel.getCategoryBreakdown(filters);
      
      res.json({
        success: true,
        data: data.map(item => ({
          category: item.category,
          sales: parseFloat(item.sales),
          profit: parseFloat(item.profit),
          unitsSold: parseInt(item.units_sold)
        }))
      });
    } catch (error) {
      console.error('Error in getCategoryBreakdown:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category breakdown',
        error: error.message
      });
    }
  }

  /**
   * Get Region Analysis
   */
  static async getRegionAnalysis(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category
      };

      const data = await DashboardModel.getRegionAnalysis(filters);
      
      res.json({
        success: true,
        data: data.map(item => ({
          region: item.region,
          country: item.country,
          sales: parseFloat(item.sales),
          profit: parseFloat(item.profit),
          orders: parseInt(item.orders),
          customers: parseInt(item.customers)
        }))
      });
    } catch (error) {
      console.error('Error in getRegionAnalysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch region analysis',
        error: error.message
      });
    }
  }

  /**
   * Get Top Products
   */
  static async getTopProducts(req, res) {
    try {
      const limit = req.query.limit || 10;
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region
      };

      const data = await DashboardModel.getTopProducts(limit, filters);
      
      res.json({
        success: true,
        data: data.map(item => ({
          product: item.product,
          sku: item.sku,
          category: item.category,
          unitsSold: parseInt(item.units_sold),
          sales: parseFloat(item.sales),
          profit: parseFloat(item.profit)
        }))
      });
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top products',
        error: error.message
      });
    }
  }

  /**
   * Get Raw Data
   */
  static async getRawData(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region,
        product: req.query.product,
        search: req.query.search
      };

      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const result = await DashboardModel.getRawData(filters, pagination);
      
      res.json({
        success: true,
        data: result.data.map(item => ({
          orderId: item.order_id,
          orderNumber: item.order_number,
          orderDate: item.order_date,
          product: item.product,
          category: item.category,
          region: item.region,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          sales: parseFloat(item.sales),
          profit: parseFloat(item.profit),
          customer: item.customer
        })),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getRawData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch raw data',
        error: error.message
      });
    }
  }

  /**
   * Get Filter Options
   */
  static async getFilterOptions(req, res) {
    try {
      const data = await DashboardModel.getFilterOptions();
      
      res.json({
        success: true,
        data: {
          categories: data.categories.map(c => c.name),
          regions: data.regions.map(r => r.name),
          products: data.products.map(p => p.name)
        }
      });
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch filter options',
        error: error.message
      });
    }
  }

  /**
   * Get Insights
   */
  static async getInsights(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region
      };

      const insights = await DashboardModel.getInsights(filters);
      
      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error in getInsights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch insights',
        error: error.message
      });
    }
  }

  /**
   * Export Data to CSV
   */
  static async exportCSV(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        region: req.query.region,
        product: req.query.product
      };

      const pagination = {
        page: 1,
        limit: 10000 // Large limit for export
      };

      const result = await DashboardModel.getRawData(filters, pagination);
      
      // Convert to CSV
      const headers = ['Order ID', 'Order Number', 'Order Date', 'Product', 'Category', 'Region', 'Quantity', 'Price', 'Sales', 'Profit', 'Customer'];
      const rows = result.data.map(item => [
        item.order_id,
        item.order_number,
        item.order_date,
        item.product,
        item.category,
        item.region,
        item.quantity,
        item.price,
        item.sales,
        item.profit,
        item.customer
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sales-data.csv"');
      res.send(csv);
    } catch (error) {
      console.error('Error in exportCSV:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export CSV',
        error: error.message
      });
    }
  }
}

module.exports = DashboardController;
