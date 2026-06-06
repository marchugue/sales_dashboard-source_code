import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

// Currency formatting config with exchange rates (relative to USD)
const currencyConfig = {
  usd: { symbol: '$', locale: 'en-US', code: 'USD', rate: 1 },
  eur: { symbol: '€', locale: 'de-DE', code: 'EUR', rate: 0.92 },
  gbp: { symbol: '£', locale: 'en-GB', code: 'GBP', rate: 0.79 },
  jpy: { symbol: '¥', locale: 'ja-JP', code: 'JPY', rate: 149.50 },
  php: { symbol: '₱', locale: 'en-PH', code: 'PHP', rate: 56.25 },
};

// Date format config
const dateFormatConfig = {
  mdy: { format: 'MM/dd/yyyy' },
  dmy: { format: 'dd/MM/yyyy' },
  ymd: { format: 'yyyy/MM/dd' },
};

export function SettingsProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('dashboard_profile');
    return saved ? JSON.parse(saved) : {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@company.com',
      jobTitle: 'Sales Manager',
    };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('dashboard_notifications');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      dailySummary: true,
      weeklyDigest: false,
      pushNotifications: true,
      salesAlerts: true,
    };
  });

  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('dashboard_appearance');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      density: 'comfortable',
    };
  });

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('dashboard_language');
    return saved ? JSON.parse(saved) : {
      language: 'en',
      currency: 'usd',
      dateFormat: 'mdy',
    };
  });

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('dashboard_profile', JSON.stringify(newProfile));
  };

  const updateNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    localStorage.setItem('dashboard_notifications', JSON.stringify(newNotifications));
  };

  const updateAppearance = (newAppearance) => {
    setAppearance(newAppearance);
    localStorage.setItem('dashboard_appearance', JSON.stringify(newAppearance));
  };

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      root.classList.remove('light', 'dark');
      
      if (appearance.theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(appearance.theme);
      }
    };
    
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (appearance.theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance.theme]);

  // Apply density class to body
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    body.classList.add(`density-${appearance.density}`);
  }, [appearance.density]);

  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('dashboard_language', JSON.stringify(newLanguage));
  };

  // Helper functions for formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const config = currencyConfig[language.currency] || currencyConfig.usd;
    const converted = value * config.rate;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const format = dateFormatConfig[language.dateFormat]?.format || 'MM/dd/yyyy';
    
    const pad = (n) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    
    return format
      .replace('yyyy', yyyy)
      .replace('MM', MM)
      .replace('dd', dd);
  };

  const value = {
    profile,
    notifications,
    appearance,
    language,
    currency: language.currency,
    currencyConfig,
    updateProfile,
    updateNotifications,
    updateAppearance,
    updateLanguage,
    formatCurrency,
    formatDate,
    dateFormatConfig,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
