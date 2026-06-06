import { dashboardAPI } from './api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Default format currency function (USD)
const defaultFormatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '$0';
  return '$' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Generate PDF report
export async function generatePDF(reportType, data, dateRange, formatCurrency = defaultFormatCurrency) {
  const doc = new jsPDF();
  
  console.log('PDF generating with data:', JSON.stringify(data, null, 2));
  
  // Header
  doc.setFontSize(20);
  doc.text(`${reportType}`, 14, 20);
  
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 37);
  
  let yPos = 50;
  
  // Extract data with fallbacks - handle both response formats
  const kpi = data.kpi || {};
  const trend = Array.isArray(data.trend) ? data.trend : [];
  const category = Array.isArray(data.category) ? data.category : [];
  const region = Array.isArray(data.region) ? data.region : [];
  
  // Debug: log what we have
  console.log('KPI:', kpi);
  console.log('Trend count:', trend.length);
  console.log('Category count:', category.length);
  console.log('Region count:', region.length);
  
  // Always show KPI section
  doc.setFontSize(14);
  doc.text('Key Metrics', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  
  // Handle various field name formats from API
  const totalSales = parseFloat(kpi.totalSales || kpi.total_sales || kpi.sales || 0);
  const totalProfit = parseFloat(kpi.totalProfit || kpi.total_profit || kpi.profit || 0);
  const totalOrders = parseInt(kpi.totalOrders || kpi.total_orders || kpi.orders || 0);
  
  doc.text(`Total Sales: ${formatCurrency(totalSales)}`, 14, yPos);
  yPos += 7;
  doc.text(`Total Profit: ${formatCurrency(totalProfit)}`, 14, yPos);
  yPos += 7;
  doc.text(`Total Orders: ${totalOrders.toLocaleString()}`, 14, yPos);
  yPos += 15;
  
  // Sales Trend Table
  if (trend.length > 0) {
    doc.setFontSize(14);
    doc.text('Sales Trend', 14, yPos);
    yPos += 10;
    
    const tableData = trend.map(item => [
      item.period || item.date || item.order_date || '',
      formatCurrency(parseFloat(item.sales || item.total_sales || 0)),
      formatCurrency(parseFloat(item.profit || item.total_profit || 0))
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Period', 'Sales', 'Profit']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Category Analysis
  if (reportType === 'Category Analysis' && category.length > 0) {
    doc.setFontSize(14);
    doc.text('Sales by Category', 14, yPos);
    yPos += 10;
    
    const tableData = category.map(item => [
      item.category || item.category_name || 'Unknown',
      formatCurrency(parseFloat(item.sales || item.total_sales || 0)),
      formatCurrency(parseFloat(item.profit || item.total_profit || 0)),
      parseInt(item.unitsSold || item.units_sold || item.total_units || 0).toLocaleString()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Sales', 'Profit', 'Units']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  }
  
  // Regional Performance
  if (reportType === 'Regional Performance' && region.length > 0) {
    doc.setFontSize(14);
    doc.text('Sales by Region', 14, yPos);
    yPos += 10;
    
    const tableData = region.map(item => [
      item.region || item.region_name || 'Unknown',
      item.country || '',
      formatCurrency(parseFloat(item.sales || item.total_sales || 0)),
      parseInt(item.orders || item.total_orders || 0).toLocaleString()
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Region', 'Country', 'Sales', 'Orders']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });
  }
  
  // Save
  doc.save(`${reportType.toLowerCase().replace(/\s+/g, '-')}-${dateRange.startDate}.pdf`);
  return true;
}

// Generate Excel report
export async function generateExcel(reportType, data, dateRange, formatCurrency = defaultFormatCurrency) {
  const wb = XLSX.utils.book_new();
  
  const totalSales = data.kpi?.totalSales || data.kpi?.total_sales || 0;
  const totalProfit = data.kpi?.totalProfit || data.kpi?.total_profit || 0;
  const totalOrders = data.kpi?.totalOrders || data.kpi?.total_orders || 0;
  
  // Summary sheet
  const summaryData = [
    ['Report Type', reportType],
    ['Generated', new Date().toLocaleString()],
    ['Period From', dateRange.startDate],
    ['Period To', dateRange.endDate],
    [],
    ['Key Metrics'],
    ['Total Sales', formatCurrency(totalSales)],
    ['Total Profit', formatCurrency(totalProfit)],
    ['Total Orders', totalOrders],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Data sheets
  if (data.trend && data.trend.length > 0) {
    const trendWs = XLSX.utils.json_to_sheet(data.trend);
    XLSX.utils.book_append_sheet(wb, trendWs, 'Sales Trend');
  }
  
  if (data.category && data.category.length > 0) {
    const categoryWs = XLSX.utils.json_to_sheet(data.category);
    XLSX.utils.book_append_sheet(wb, categoryWs, 'By Category');
  }
  
  if (data.region && data.region.length > 0) {
    const regionWs = XLSX.utils.json_to_sheet(data.region);
    XLSX.utils.book_append_sheet(wb, regionWs, 'By Region');
  }
  
  XLSX.writeFile(wb, `${reportType.toLowerCase().replace(/\s+/g, '-')}-${dateRange.startDate}.xlsx`);
  return true;
}

// Generate CSV (raw data)
export async function generateCSV(reportType, data, dateRange, formatCurrency = defaultFormatCurrency) {
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  const totalSales = data.kpi?.totalSales || data.kpi?.total_sales || 0;
  const totalProfit = data.kpi?.totalProfit || data.kpi?.total_profit || 0;
  const totalOrders = data.kpi?.totalOrders || data.kpi?.total_orders || 0;
  
  // Header
  csvContent += `Report: ${reportType}\n`;
  csvContent += `Period: ${dateRange.startDate} to ${dateRange.endDate}\n`;
  csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary
  csvContent += `Key Metrics\n`;
  csvContent += `Total Sales,${formatCurrency(totalSales)}\n`;
  csvContent += `Total Profit,${formatCurrency(totalProfit)}\n`;
  csvContent += `Total Orders,${totalOrders}\n\n`;
  
  // Data
  if (data.trend?.length > 0) {
    csvContent += 'Sales Trend\n';
    csvContent += 'Period,Sales,Profit,Orders\n';
    data.trend.forEach(row => {
      csvContent += `${row.period},${row.sales},${row.profit},${row.orders}\n`;
    });
    csvContent += '\n';
  }
  
  if (data.category?.length > 0) {
    csvContent += 'Category Analysis\n';
    csvContent += 'Category,Sales,Profit,Units Sold\n';
    data.category.forEach(row => {
      csvContent += `${row.category},${row.sales},${row.profit},${row.unitsSold}\n`;
    });
    csvContent += '\n';
  }
  
  if (data.region?.length > 0) {
    csvContent += 'Regional Performance\n';
    csvContent += 'Region,Country,Sales,Orders,Customers\n';
    data.region.forEach(row => {
      csvContent += `${row.region},${row.country || ''},${row.sales},${row.orders},${row.customers}\n`;
    });
  }
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${reportType.toLowerCase().replace(/\s+/g, '-')}-${dateRange.startDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
