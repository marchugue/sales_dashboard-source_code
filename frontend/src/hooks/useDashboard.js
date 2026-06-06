import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardAPI } from '@/services/api';

// Generic hook for API calls with loading and error states
const useAPICall = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use ref to avoid dependency issues with apiFunction
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const fetchData = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunctionRef.current(params);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - uses ref

  // Only refetch when params actually change
  const paramsKey = JSON.stringify(initialParams);
  useEffect(() => {
    fetchData(initialParams);
  }, [fetchData, paramsKey]);

  return { data, loading, error, refetch: fetchData };
};

// Generic hook for API calls with period parameter (for Sales Trend)
const useAPICallWithPeriod = (apiFunction, initialParams = {}, period) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use ref to avoid dependency issues with apiFunction
  const apiFunctionRef = useRef(apiFunction);
  apiFunctionRef.current = apiFunction;

  const fetchData = useCallback(async (params = initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunctionRef.current(params, period);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - uses ref

  // Include period in the dependency key
  const paramsKey = JSON.stringify({ params: initialParams, period });
  useEffect(() => {
    fetchData(initialParams);
  }, [fetchData, paramsKey, period]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for KPI Summary
export const useKPISummary = (filters) => {
  return useAPICall(dashboardAPI.getKPISummary, filters);
};

// Hook for Sales Trend
export const useSalesTrend = (period, filters) => {
  return useAPICallWithPeriod(
    (params, p) => dashboardAPI.getSalesTrend(p, params),
    filters,
    period
  );
};

// Hook for Category Breakdown
export const useCategoryBreakdown = (filters) => {
  return useAPICall(dashboardAPI.getCategoryBreakdown, filters);
};

// Hook for Region Analysis
export const useRegionAnalysis = (filters) => {
  return useAPICall(dashboardAPI.getRegionAnalysis, filters);
};

// Hook for Top Products
export const useTopProducts = (limit, filters) => {
  return useAPICall(
    (params) => dashboardAPI.getTopProducts(limit, params),
    filters
  );
};

// Hook for Raw Data with pagination
export const useRawData = (filters, pagination) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use refs to avoid dependency issues
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);
  filtersRef.current = filters;
  paginationRef.current = pagination;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getRawData(filtersRef.current, paginationRef.current);
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - uses refs

  // Only refetch when params actually change (using JSON for deep comparison)
  const paramsKey = JSON.stringify({ filters, pagination });
  useEffect(() => {
    fetchData();
  }, [fetchData, paramsKey]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for Filter Options
export const useFilterOptions = () => {
  return useAPICall(dashboardAPI.getFilterOptions, {});
};

// Hook for Insights
export const useInsights = (filters) => {
  return useAPICall(dashboardAPI.getInsights, filters);
};

// Hook for managing filter state
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  return { filters, updateFilter, clearFilters, removeFilter, setFilters };
};

// Hook for debounced value
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for pagination
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  const paginationProps = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };

  return {
    ...paginationProps,
    setPage,
    setLimit,
    setTotal,
    resetPagination,
  };
};
