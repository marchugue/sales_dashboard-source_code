import { useState, useEffect } from 'react';
import { User, Bell, Moon, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'language', label: 'Language & Region', icon: Globe },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { profile, notifications, appearance, language, updateProfile, updateNotifications, updateAppearance, updateLanguage } = useSettings();

  const [localProfile, setLocalProfile] = useState(profile);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [localAppearance, setLocalAppearance] = useState(appearance);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [saved, setSaved] = useState(false);

  // Sync local state with context when tab changes or context updates
  useEffect(() => { setLocalProfile(profile); }, [profile]);
  useEffect(() => { setLocalNotifications(notifications); }, [notifications]);
  useEffect(() => { setLocalAppearance(appearance); }, [appearance]);
  useEffect(() => { setLocalLanguage(language); }, [language]);

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    if (activeTab === 'profile') updateProfile(localProfile);
    if (activeTab === 'notifications') updateNotifications(localNotifications);
    if (activeTab === 'appearance') updateAppearance(localAppearance);
    if (activeTab === 'language') updateLanguage(localLanguage);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-card rounded-lg border border-border p-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border border-border">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Profile Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information and profile details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <Input
                      value={localProfile.firstName}
                      onChange={(e) => setLocalProfile({ ...localProfile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <Input
                      value={localProfile.lastName}
                      onChange={(e) => setLocalProfile({ ...localProfile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      value={localProfile.email}
                      onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                    <Input
                      value={localProfile.jobTitle}
                      onChange={(e) => setLocalProfile({ ...localProfile, jobTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={saving}>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to be notified
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email notifications' },
                    { key: 'dailySummary', label: 'Daily summary reports' },
                    { key: 'weeklyDigest', label: 'Weekly analytics digest' },
                    { key: 'pushNotifications', label: 'Push notifications' },
                    { key: 'salesAlerts', label: 'Sales threshold alerts' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent cursor-pointer"
                    >
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={localNotifications[item.key]}
                        onChange={(e) => setLocalNotifications({ ...localNotifications, [item.key]: e.target.checked })}
                        className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={saving}>
                    {saved ? 'Saved!' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Appearance</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize the look and feel of your dashboard
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Theme</label>
                    <Select
                      value={localAppearance.theme}
                      onChange={(e) => setLocalAppearance({ ...localAppearance, theme: e.target.value })}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Dashboard Density</label>
                    <Select
                      value={localAppearance.density}
                      onChange={(e) => setLocalAppearance({ ...localAppearance, density: e.target.value })}
                    >
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="spacious">Spacious</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={saving}>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Language & Region</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred language and regional format
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Language</label>
                    <Select
                      value={localLanguage.language}
                      onChange={(e) => setLocalLanguage({ ...localLanguage, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Currency</label>
                    <Select
                      value={localLanguage.currency}
                      onChange={(e) => setLocalLanguage({ ...localLanguage, currency: e.target.value })}
                    >
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                      <option value="jpy">JPY (¥)</option>
                      <option value="php">PHP (₱)</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date Format</label>
                    <Select
                      value={localLanguage.dateFormat}
                      onChange={(e) => setLocalLanguage({ ...localLanguage, dateFormat: e.target.value })}
                    >
                      <option value="mdy">MM/DD/YYYY</option>
                      <option value="dmy">DD/MM/YYYY</option>
                      <option value="ymd">YYYY/MM/DD</option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={saving}>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export { Settings as default };
