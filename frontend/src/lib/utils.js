import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '@/context/SettingsContext';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Hook for settings-aware formatting
export function useFormat() {
  const { formatCurrency: settingsFormatCurrency, formatDate: settingsFormatDate } = useSettings();
  
  return {
    formatCurrency: settingsFormatCurrency,
    formatDate: settingsFormatDate,
  };
}

// Format number as currency
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format number with commas
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Format percentage
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Format date
export function formatDate(date, options = {}) {
  if (!date) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date) {
  if (!date) return '-';
  
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

// Truncate text
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Calculate percentage change
export function calculateChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// Get initials from name
export function getInitials(name, fallback = '??') {
  if (!name) return fallback;
  
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate color from string
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

// Sort array by key
export function sortBy(array, key, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (direction === 'desc') {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
}

// Get trend indicator
export function getTrendIndicator(value) {
  if (value > 0) return { direction: 'up', color: 'text-emerald-600', icon: 'TrendingUp' };
  if (value < 0) return { direction: 'down', color: 'text-rose-600', icon: 'TrendingDown' };
  return { direction: 'neutral', color: 'text-slate-500', icon: 'Minus' };
}
