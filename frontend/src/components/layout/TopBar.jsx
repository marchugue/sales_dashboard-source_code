import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Menu,
  Bell,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSettings } from '@/context/SettingsContext';
import { format, differenceInDays, isSameDay, subDays } from 'date-fns';

const datePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
];

export function TopBar({
  onMenuClick,
  onFilterClick,
  dateRange,
  onDateRangeChange,
  filterCount = 0,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const datePickerRef = useRef(null);
  const notificationsRef = useRef(null);
  const { formatDate } = useSettings();

  // Format date range in readable format
  const formatDateRangeReadable = useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return 'Last 30 days';
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const today = new Date();
    const daysDiff = differenceInDays(end, start);
    const isEndToday = isSameDay(end, today);
    
    // Check if matches a preset
    if (isEndToday) {
      const preset = datePresets.find(p => p.days === daysDiff);
      if (preset) return preset.label;
    }
    
    // Format as "Jun 1 - Jun 7, 2026" or "Dec 31, 2025 - Jan 1, 2026"
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = start.getMonth() === end.getMonth();
    
    if (sameYear && sameMonth) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    } else if (sameYear) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    }
  }, [dateRange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetClick = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateRangeChange?.({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setShowDatePicker(false);
  };

  const notifications = [
    { id: 0, title: 'About This Project', message: 'Dashboard data is fetched from a real MySQL database. These notifications are static/demo only. The project primarily focuses on data analysis skills and dashboard UI/UX design.', time: 'now', unread: true },
    { id: 1, title: 'Sales target reached', message: 'You\'ve exceeded your monthly sales goal by 15%', time: '2m ago', unread: false },
    { id: 2, title: 'New order received', message: 'Order #12345 from Acme Corp', time: '1h ago', unread: false },
    { id: 3, title: 'Report generated', message: 'Monthly analytics report is ready', time: '3h ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <div className="hidden sm:flex items-center relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">
                {formatDateRangeReadable}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showDatePicker && 'rotate-180')} />
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-50 py-2">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-700">Select date range</p>
                </div>
                {datePresets.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => handlePresetClick(preset.days)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                  >
                    {preset.label}
                    {dateRange?.startDate && 
                     Math.abs(new Date(dateRange.startDate) - new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000)) < 1000 && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter button */}
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                filterCount > 0
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Filter className="w-4 h-4" />
              {filterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {filterCount}
                </span>
              )}
              <span className="hidden lg:inline">Filters</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-lg border border-border shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-card-foreground">Notifications</p>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-4 py-3 border-b border-border hover:bg-accent cursor-pointer',
                        notification.unread && 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {notification.unread && (
                          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-card-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-xs text-primary hover:text-primary/80 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
