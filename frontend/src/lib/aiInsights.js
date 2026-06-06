/**
 * AI Insights Generator
 * Analyzes dashboard data and generates meaningful insights
 */

// Generate insights from dashboard data
export function generateInsights(data, period = 'monthly') {
  const insights = [];
  const { kpi, trend, category, region, topProducts } = data;

  if (!kpi || !trend) return getDefaultInsights();

  // 1. Sales Trend Analysis
  if (trend.length >= 2) {
    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));
    
    const firstHalfSales = firstHalf.reduce((sum, item) => sum + (item.sales || 0), 0);
    const secondHalfSales = secondHalf.reduce((sum, item) => sum + (item.sales || 0), 0);
    
    const growthRate = firstHalfSales > 0 
      ? ((secondHalfSales - firstHalfSales) / firstHalfSales) * 100 
      : 0;

    if (growthRate > 10) {
      insights.push({
        type: 'positive',
        title: 'Strong Sales Growth',
        description: `Sales have increased by ${growthRate.toFixed(1)}% in the recent period compared to the previous half. This positive trend indicates growing market demand.`,
        metric: `+${growthRate.toFixed(1)}% growth`,
      });
    } else if (growthRate < -10) {
      insights.push({
        type: 'negative',
        title: 'Sales Declining',
        description: `Sales have decreased by ${Math.abs(growthRate).toFixed(1)}% recently. Consider reviewing marketing strategies and customer engagement.`,
        metric: `${growthRate.toFixed(1)}% decline`,
      });
    }
  }

  // 2. Profit Margin Analysis
  if (kpi.totalSales > 0 && kpi.totalProfit > 0) {
    const profitMargin = (kpi.totalProfit / kpi.totalSales) * 100;
    
    if (profitMargin > 30) {
      insights.push({
        type: 'positive',
        title: 'Healthy Profit Margins',
        description: `Your profit margin of ${profitMargin.toFixed(1)}% is excellent. This indicates efficient cost management and strong pricing power.`,
        metric: `${profitMargin.toFixed(1)}% margin`,
      });
    } else if (profitMargin < 15) {
      insights.push({
        type: 'warning',
        title: 'Low Profit Margins',
        description: `Current profit margin is ${profitMargin.toFixed(1)}%. Consider optimizing costs or adjusting pricing strategies to improve profitability.`,
        metric: `${profitMargin.toFixed(1)}% margin`,
      });
    }
  }

  // 3. Category Performance
  if (category && category.length > 0) {
    const sortedCategories = [...category].sort((a, b) => (b.sales || 0) - (a.sales || 0));
    const topCategory = sortedCategories[0];
    const bottomCategory = sortedCategories[sortedCategories.length - 1];
    
    const totalSales = sortedCategories.reduce((sum, cat) => sum + (cat.sales || 0), 0);
    const topCategoryShare = totalSales > 0 ? ((topCategory.sales / totalSales) * 100).toFixed(0) : 0;

    if (topCategoryShare > 40) {
      insights.push({
        type: 'info',
        title: 'Category Concentration',
        description: `${topCategory.category} dominates with ${topCategoryShare}% of total sales. Consider diversifying to reduce dependency on a single category.`,
        metric: `${topCategoryShare}% of revenue`,
      });
    }

    // Check for underperforming categories
    const underperforming = sortedCategories.filter(cat => {
      const catSales = cat.sales || 0;
      const avgSales = totalSales / sortedCategories.length;
      return catSales < avgSales * 0.5 && catSales > 0;
    });

    if (underperforming.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Underperforming Categories',
        description: `${underperforming.length} categor${underperforming.length === 1 ? 'y is' : 'ies are'} performing below 50% of average sales. Review marketing and inventory for these segments.`,
        metric: `${underperforming.length} categories`,
      });
    }
  }

  // 4. Regional Analysis
  if (region && region.length > 0) {
    const sortedRegions = [...region].sort((a, b) => (b.sales || 0) - (a.sales || 0));
    const topRegion = sortedRegions[0];
    
    if (topRegion) {
      insights.push({
        type: 'info',
        title: 'Top Performing Region',
        description: `${topRegion.region} is your strongest market. Consider increasing investment in this region and analyzing what drives success here.`,
        metric: `${topRegion.region}`,
      });
    }
  }

  // 5. Order Value Analysis
  if (kpi.totalOrders > 0 && kpi.totalSales > 0) {
    const aov = kpi.totalSales / kpi.totalOrders;
    
    if (aov > 1000) {
      insights.push({
        type: 'positive',
        title: 'High Average Order Value',
        description: `Your AOV of $${aov.toFixed(0)} is strong. Focus on maintaining product quality and upselling strategies to sustain this.`,
        metric: `$${aov.toFixed(0)} AOV`,
      });
    } else if (aov < 200) {
      insights.push({
        type: 'info',
        title: 'Opportunity to Increase AOV',
        description: `Current AOV is $${aov.toFixed(0)}. Consider bundle offers, cross-selling, and minimum order incentives to increase order values.`,
        metric: `$${aov.toFixed(0)} AOV`,
      });
    }
  }

  // 6. Trend Volatility
  if (trend.length >= 3) {
    const salesValues = trend.map(t => t.sales || 0);
    const avg = salesValues.reduce((a, b) => a + b, 0) / salesValues.length;
    const variance = salesValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / salesValues.length;
    const volatility = (Math.sqrt(variance) / avg) * 100;

    if (volatility > 50) {
      insights.push({
        type: 'warning',
        title: 'High Sales Volatility',
        description: `Sales fluctuate significantly (${volatility.toFixed(0)}% volatility). Consider strategies to stabilize revenue such as subscriptions or recurring orders.`,
        metric: `${volatility.toFixed(0)}% volatility`,
      });
    }
  }

  // Return top 4 insights or default if none generated
  return insights.length > 0 ? insights.slice(0, 4) : getDefaultInsights();
}

// Default insights when no data is available
function getDefaultInsights() {
  return [
    {
      type: 'info',
      title: 'Welcome to AI Insights',
      description: 'Select a date range to see AI-powered analysis of your sales data, trends, and opportunities.',
      metric: 'Select date range',
    },
    {
      type: 'info',
      title: 'Data Analysis Ready',
      description: 'Our AI will analyze your KPIs, trends, category performance, and regional data once data is loaded.',
    },
  ];
}

// Format number helper
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
