import { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

// Create context for sharing header state between Layout and pages
const HeaderContext = createContext(null);

export function useHeader() {
  return useContext(HeaderContext);
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Header state that can be controlled by pages
  const [headerState, setHeaderState] = useState({
    dateRange: null,
    filterCount: 0,
    onFilterClick: null,
    onDateRangeChange: null,
  });

  const updateHeader = useCallback((updates) => {
    setHeaderState(prev => ({ ...prev, ...updates }));
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    headerState, 
    updateHeader 
  }), [headerState, updateHeader]);

  // Handle window resize for sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out relative',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onFilterClick={headerState.onFilterClick}
          dateRange={headerState.dateRange}
          onDateRangeChange={headerState.onDateRangeChange}
          filterCount={headerState.filterCount}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-background">
          <HeaderContext.Provider value={contextValue}>
            <Outlet />
          </HeaderContext.Provider>
        </main>
      </div>
    </div>
  );
}
