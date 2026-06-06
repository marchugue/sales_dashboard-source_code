const { query } = require('../config/database');

class DashboardModel {
  /**
   * Get KPI Summary (Total Sales, Profit, Orders, AOV)
   */
  static async getKPISummary(filters = {}) {
    const { startDate, endDate, category, region } = filters;
    
    let whereClause = "WHERE o.status != 'cancelled'";
    const params = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (category) {
      whereClause += " AND c.category_name = ?";
      params.push(category);
    }
    if (region) {
      whereClause += " AND r.region_name = ?";
      params.push(region);
    }

    const sql = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(SUM(o.grand_total), 0) as total_sales,
        COALESCE(SUM(o.grand_total - (oi.quantity * p.cost_price)), 0) as total_profit,
        COALESCE(AVG(o.grand_total), 0) as average_order_value
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
    `;

    const results = await query(sql, params);
    return results[0];
  }

  /**
   * Get Sales Trend (daily/monthly)
   */
  static async getSalesTrend(period = 'daily', filters = {}) {
    const { startDate, endDate, category, region } = filters;
    
    let dateFormat = period === 'monthly' ? '%Y-%m' : '%Y-%m-%d';
    let whereClause = "WHERE o.status != 'cancelled'";
    const params = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (category) {
      whereClause += " AND c.category_name = ?";
      params.push(category);
    }
    if (region) {
      whereClause += " AND r.region_name = ?";
      params.push(region);
    }

    const sql = `
      SELECT 
        DATE_FORMAT(o.order_date, '${dateFormat}') as period,
        COUNT(DISTINCT o.order_id) as orders,
        COALESCE(SUM(o.grand_total), 0) as sales,
        COALESCE(SUM(o.grand_total - (oi.quantity * p.cost_price)), 0) as profit
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `;

    return await query(sql, params);
  }

  /**
   * Get Sales by Category
   */
  static async getCategoryBreakdown(filters = {}) {
    const { startDate, endDate, region } = filters;
    
    let whereClause = "WHERE o.status != 'cancelled'";
    const params = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (region) {
      whereClause += " AND r.region_name = ?";
      params.push(region);
    }

    const sql = `
      SELECT 
        c.category_name as category,
        COALESCE(SUM(oi.line_total), 0) as sales,
        COALESCE(SUM(oi.line_total - (oi.quantity * p.cost_price)), 0) as profit,
        SUM(oi.quantity) as units_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      JOIN orders o ON oi.order_id = o.order_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
      GROUP BY c.category_id, c.category_name
      ORDER BY sales DESC
    `;

    return await query(sql, params);
  }

  /**
   * Get Sales by Region
   */
  static async getRegionAnalysis(filters = {}) {
    const { startDate, endDate, category } = filters;
    
    let whereClause = "WHERE o.status != 'cancelled' AND r.region_name IS NOT NULL";
    const params = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (category) {
      whereClause += " AND c.category_name = ?";
      params.push(category);
    }

    const sql = `
      SELECT 
        r.region_name as region,
        r.country,
        COALESCE(SUM(o.grand_total), 0) as sales,
        COALESCE(SUM(o.grand_total - (oi.quantity * p.cost_price)), 0) as profit,
        COUNT(DISTINCT o.order_id) as orders,
        COUNT(DISTINCT o.customer_id) as customers
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
      GROUP BY r.region_id, r.region_name, r.country
      ORDER BY sales DESC
    `;

    return await query(sql, params);
  }

  /**
   * Get Top Products
   */
  static async getTopProducts(limit = 10, filters = {}) {
    const { startDate, endDate, category, region } = filters;
    
    let whereClause = "WHERE o.status != 'cancelled'";
    const params = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (category) {
      whereClause += " AND c.category_name = ?";
      params.push(category);
    }
    if (region) {
      whereClause += " AND r.region_name = ?";
      params.push(region);
    }

    const limitValue = parseInt(limit) || 10;

    const sql = `
      SELECT 
        p.product_name as product,
        p.sku,
        c.category_name as category,
        SUM(oi.quantity) as units_sold,
        COALESCE(SUM(oi.line_total), 0) as sales,
        COALESCE(SUM(oi.line_total - (oi.quantity * p.cost_price)), 0) as profit
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      JOIN orders o ON oi.order_id = o.order_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
      GROUP BY p.product_id, p.product_name, p.sku, c.category_name
      ORDER BY sales DESC
      LIMIT ${limitValue}
    `;

    return await query(sql, params);
  }

  /**
   * Get Raw Data for Table with Pagination
   */
  static async getRawData(filters = {}, pagination = {}) {
    const { startDate, endDate, category, region, product, search } = filters;
    const { page = 1, limit = 50 } = pagination;
    
    let whereClause = "WHERE o.status != 'cancelled'";
    const params = [];
    const countParams = [];

    if (startDate) {
      whereClause += " AND o.order_date >= ?";
      params.push(startDate);
      countParams.push(startDate);
    }
    if (endDate) {
      whereClause += " AND o.order_date <= ?";
      params.push(endDate);
      countParams.push(endDate);
    }
    if (category) {
      whereClause += " AND c.category_name = ?";
      params.push(category);
      countParams.push(category);
    }
    if (region) {
      whereClause += " AND r.region_name = ?";
      params.push(region);
      countParams.push(region);
    }
    if (product) {
      whereClause += " AND p.product_name LIKE ?";
      params.push(`%${product}%`);
      countParams.push(`%${product}%`);
    }
    if (search) {
      whereClause += ` AND (
        p.product_name LIKE ? OR 
        o.order_number LIKE ? OR 
        c.category_name LIKE ? OR 
        r.region_name LIKE ? OR
        CONCAT(cust.first_name, ' ', cust.last_name) LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const limitValue = parseInt(limit) || 10;
    const offsetValue = (parseInt(page) - 1) * limitValue;

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
    `;

    // Get data
    const dataSql = `
      SELECT 
        o.order_id,
        o.order_number,
        o.order_date,
        p.product_name as product,
        c.category_name as category,
        r.region_name as region,
        oi.quantity,
        oi.unit_price as price,
        oi.line_total as sales,
        (oi.line_total - (oi.quantity * p.cost_price)) as profit,
        CONCAT(cust.first_name, ' ', cust.last_name) as customer
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN customers cust ON o.customer_id = cust.customer_id
      LEFT JOIN regions r ON cust.region_id = r.region_id
      ${whereClause}
      ORDER BY o.order_date DESC
      LIMIT ${limitValue} OFFSET ${offsetValue}
    `;

    const [countResult, data] = await Promise.all([
      query(countSql, countParams),
      query(dataSql, params)
    ]);

    const total = countResult[0].total;

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get Filter Options
   */
  static async getFilterOptions() {
    const categoriesSql = `SELECT category_name as name FROM categories WHERE is_active = 1 ORDER BY category_name`;
    const regionsSql = `SELECT region_name as name FROM regions ORDER BY region_name`;
    const productsSql = `SELECT DISTINCT product_name as name FROM products WHERE is_active = 1 ORDER BY product_name`;

    const [categories, regions, products] = await Promise.all([
      query(categoriesSql),
      query(regionsSql),
      query(productsSql)
    ]);

    return { categories, regions, products };
  }

  /**
   * Get AI-style Insights
   */
  static async getInsights(filters = {}) {
    const kpi = await this.getKPISummary(filters);
    const trend = await this.getSalesTrend('monthly', filters);
    const categories = await this.getCategoryBreakdown(filters);

    const insights = [];

    // Calculate growth
    if (trend.length >= 2) {
      const current = trend[trend.length - 1]?.sales || 0;
      const previous = trend[trend.length - 2]?.sales || 0;
      const growth = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : 0;
      
      if (growth > 0) {
        insights.push(`📈 Sales increased ${growth}% compared to previous period`);
      } else if (growth < 0) {
        insights.push(`📉 Sales decreased ${Math.abs(growth)}% compared to previous period`);
      }
    }

    // Top category insight
    if (categories.length > 0) {
      const topCategory = categories[0];
      const totalSales = categories.reduce((sum, cat) => sum + parseFloat(cat.sales), 0);
      const percentage = ((topCategory.sales / totalSales) * 100).toFixed(1);
      insights.push(`🏆 ${topCategory.category} dominates revenue with ${percentage}% of total sales`);
    }

    // Profit margin insight
    if (kpi.total_sales > 0) {
      const margin = ((kpi.total_profit / kpi.total_sales) * 100).toFixed(1);
      insights.push(`💰 Overall profit margin is ${margin}%`);
    }

    // AOV insight
    if (kpi.average_order_value > 0) {
      insights.push(`🛒 Average Order Value is ₱${parseFloat(kpi.average_order_value).toFixed(2)}`);
    }

    return insights;
  }
}

module.exports = DashboardModel;
