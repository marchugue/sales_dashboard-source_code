import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn, getInitials } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import {
  LayoutDashboard,
  BarChart3,
  Table2,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Data Explorer', href: '/data', icon: Table2 },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { profile } = useSettings();

  return (
    <>
      {/* Mobile overlay - only render when open and on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-background border-r border-border',
          'flex flex-col transition-all duration-300 ease-in-out',
          'lg:fixed lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-card">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-card-foreground">SalesDash</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={() => onClose?.()}
            className="lg:hidden p-2 rounded-md hover:bg-accent text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {navigation.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={index === 0} // Add end prop for Dashboard (first item) to match exact path
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                    'hover:bg-accent',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                    collapsed && 'justify-center'
                  )
                }
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'w-6 h-6')} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Support
              </p>
            )}
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                    'hover:bg-accent',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                    collapsed && 'justify-center'
                  )
                }
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'w-6 h-6')} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {getInitials(`${profile.firstName} ${profile.lastName}`)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
