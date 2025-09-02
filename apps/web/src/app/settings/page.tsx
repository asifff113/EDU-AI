'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/contexts/AppContext';
import {
  Bell,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';

interface UserSettings {
  // Account Settings
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;

  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  courseUpdates: boolean;
  messageNotifications: boolean;

  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  showEmail: boolean;
  showPhone: boolean;
  dataCollection: boolean;

  // Appearance Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';

  // Learning Settings
  studyReminders: boolean;
  studyReminderTime: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  autoplay: boolean;
  subtitles: boolean;
  playbackSpeed: number;

  // Communication Settings
  allowVideoCall: boolean;
  allowVoiceCall: boolean;
  allowScreenShare: boolean;
  defaultMeetingDuration: number;
}

const defaultSettings: UserSettings = {
  twoFactorEnabled: false,
  emailVerified: false,
  phoneVerified: false,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
  courseUpdates: true,
  messageNotifications: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
  allowDirectMessages: true,
  showEmail: false,
  showPhone: false,
  dataCollection: true,
  theme: 'system',
  language: 'en',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  studyReminders: true,
  studyReminderTime: '19:00',
  difficultyLevel: 'intermediate',
  autoplay: false,
  subtitles: true,
  playbackSpeed: 1.0,
  allowVideoCall: true,
  allowVoiceCall: true,
  allowScreenShare: false,
  defaultMeetingDuration: 30,
};

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const { user } = useAppContext();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      } else {
        console.error('Failed to fetch settings');
        // Keep default settings
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Keep default settings
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/settings/export', {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eduai-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      try {
        const response = await fetch('/api/settings/delete-account', {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          alert('Account deleted successfully');
          window.location.href = '/';
        } else {
          alert('Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account');
      }
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-lg">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Control Center Header */}
      <div
        className="relative group bg-gradient-to-r from-slate-600/20 via-gray-700/15 to-zinc-600/20 
         rounded-2xl p-8 border border-slate-600/20 backdrop-blur-xl shadow-2xl shadow-slate-600/10
         hover:shadow-3xl hover:shadow-slate-600/20 transition-all duration-700 transform-gpu
         before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-600/5 before:to-gray-700/5 
         before:rounded-2xl before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-600/20 group-hover:bg-slate-500/30 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 transform-gpu">
            <div className="text-3xl">⚙️</div>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white group-hover:text-slate-100 transition-colors duration-300">
              Control Center
            </h1>
            <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300 text-lg">
              Master your platform experience with comprehensive system controls
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        {/* Enhanced Tab Navigation */}
        <div
          className="relative group bg-gradient-to-r from-gray-600/20 via-slate-700/15 to-zinc-600/20 
          backdrop-blur-xl shadow-xl shadow-gray-600/20 hover:shadow-2xl hover:shadow-gray-600/30
          transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 transform-gpu perspective-1000
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-600/10 before:to-slate-700/10 
          before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100
          rounded-2xl p-6 border border-gray-600/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
          <div className="relative z-10">
            <div className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <div className="text-2xl">🎛️</div>
              System Configuration
            </div>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 bg-transparent p-0">
              <TabsTrigger
                value="account"
                className="group/tab relative bg-blue-500/20 hover:bg-blue-400/30 data-[state=active]:bg-blue-500/40 
                  text-blue-200 hover:text-blue-100 data-[state=active]:text-blue-100 
                  border border-blue-400/30 hover:border-blue-300/50 data-[state=active]:border-blue-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <User className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">👤 Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="group/tab relative bg-yellow-500/20 hover:bg-yellow-400/30 data-[state=active]:bg-yellow-500/40 
                  text-yellow-200 hover:text-yellow-100 data-[state=active]:text-yellow-100 
                  border border-yellow-400/30 hover:border-yellow-300/50 data-[state=active]:border-yellow-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <Bell className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">🔔 Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="group/tab relative bg-green-500/20 hover:bg-green-400/30 data-[state=active]:bg-green-500/40 
                  text-green-200 hover:text-green-100 data-[state=active]:text-green-100 
                  border border-green-400/30 hover:border-green-300/50 data-[state=active]:border-green-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <Shield className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">🛡️ Privacy</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="group/tab relative bg-purple-500/20 hover:bg-purple-400/30 data-[state=active]:bg-purple-500/40 
                  text-purple-200 hover:text-purple-100 data-[state=active]:text-purple-100 
                  border border-purple-400/30 hover:border-purple-300/50 data-[state=active]:border-purple-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <Palette className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">🎨 Theme</span>
              </TabsTrigger>
              <TabsTrigger
                value="learning"
                className="group/tab relative bg-cyan-500/20 hover:bg-cyan-400/30 data-[state=active]:bg-cyan-500/40 
                  text-cyan-200 hover:text-cyan-100 data-[state=active]:text-cyan-100 
                  border border-cyan-400/30 hover:border-cyan-300/50 data-[state=active]:border-cyan-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <Globe className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">📚 Learning</span>
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="group/tab relative bg-pink-500/20 hover:bg-pink-400/30 data-[state=active]:bg-pink-500/40 
                  text-pink-200 hover:text-pink-100 data-[state=active]:text-pink-100 
                  border border-pink-400/30 hover:border-pink-300/50 data-[state=active]:border-pink-300/70
                  transition-all duration-300 hover:scale-105 transform-gpu flex items-center gap-2 py-3"
              >
                <Smartphone className="h-4 w-4 group-hover/tab:rotate-12 transition-transform duration-300" />
                <span className="font-medium">📱 Connect</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-indigo-400/15 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-blue-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and verification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Verification</span>
                    </div>
                    <Badge variant={settings.emailVerified ? 'default' : 'secondary'}>
                      {settings.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Phone Verification</span>
                    </div>
                    <Badge variant={settings.phoneVerified ? 'default' : 'secondary'}>
                      {settings.phoneVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-teal-500/20 backdrop-blur-xl border border-emerald-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-2xl hover:shadow-emerald-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button onClick={changePassword} className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/20 via-amber-400/15 to-orange-500/20 backdrop-blur-xl border border-yellow-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-yellow-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive important updates via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive promotional content and offers</p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Course Updates</Label>
                    <p className="text-sm text-gray-500">
                      Notifications about your enrolled courses
                    </p>
                  </div>
                  <Switch
                    checked={settings.courseUpdates}
                    onCheckedChange={(checked) => updateSetting('courseUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Message Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Notifications for new messages and chats
                    </p>
                  </div>
                  <Switch
                    checked={settings.messageNotifications}
                    onCheckedChange={(checked) => updateSetting('messageNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/20 via-emerald-400/15 to-teal-500/20 backdrop-blur-xl border border-green-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-2xl hover:shadow-green-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  <Shield className="h-5 w-5" />
                  Privacy Controls
                </CardTitle>
                <CardDescription>
                  Control who can see your information and how your data is used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value: any) => updateSetting('profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                      <SelectItem value="private">
                        Private - Only you can see your profile
                      </SelectItem>
                      <SelectItem value="friends">
                        Friends - Only your connections can see
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Online Status</Label>
                    <p className="text-sm text-gray-500">Let others see when you're online</p>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Direct Messages</Label>
                    <p className="text-sm text-gray-500">Let other users send you messages</p>
                  </div>
                  <Switch
                    checked={settings.allowDirectMessages}
                    onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Email Address</Label>
                    <p className="text-sm text-gray-500">
                      Display your email on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Phone Number</Label>
                    <p className="text-sm text-gray-500">
                      Display your phone number on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => updateSetting('showPhone', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Data Collection</Label>
                    <p className="text-sm text-gray-500">
                      Allow us to collect usage data to improve the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.dataCollection}
                    onCheckedChange={(checked) => updateSetting('dataCollection', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-violet-400/15 to-fuchsia-500/20 backdrop-blur-xl border border-purple-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-purple-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  <Palette className="h-5 w-5" />
                  Appearance & Language
                </CardTitle>
                <CardDescription>
                  Customize how the platform looks and behaves for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: any) => updateSetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                      <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="ur">اردو (Urdu)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                      <SelectItem value="Asia/Karachi">Asia/Karachi (GMT+5)</SelectItem>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => updateSetting('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select
                      value={settings.timeFormat}
                      onValueChange={(value: any) => updateSetting('timeFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Settings */}
        <TabsContent value="learning" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-sky-400/15 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-2xl hover:shadow-cyan-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                  <Globe className="h-5 w-5" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize your learning experience and study habits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Study Reminders</Label>
                    <p className="text-sm text-gray-500">Get daily reminders to study</p>
                  </div>
                  <Switch
                    checked={settings.studyReminders}
                    onCheckedChange={(checked) => updateSetting('studyReminders', checked)}
                  />
                </div>

                {settings.studyReminders && (
                  <div className="space-y-2">
                    <Label>Study Reminder Time</Label>
                    <Input
                      type="time"
                      value={settings.studyReminderTime}
                      onChange={(e) => updateSetting('studyReminderTime', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Default Difficulty Level</Label>
                  <Select
                    value={settings.difficultyLevel}
                    onValueChange={(value: any) => updateSetting('difficultyLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Autoplay Videos</Label>
                    <p className="text-sm text-gray-500">Automatically play next video in course</p>
                  </div>
                  <Switch
                    checked={settings.autoplay}
                    onCheckedChange={(checked) => updateSetting('autoplay', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Show Subtitles</Label>
                    <p className="text-sm text-gray-500">Display subtitles by default</p>
                  </div>
                  <Switch
                    checked={settings.subtitles}
                    onCheckedChange={(checked) => updateSetting('subtitles', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Playback Speed</Label>
                  <Select
                    value={settings.playbackSpeed.toString()}
                    onValueChange={(value) => updateSetting('playbackSpeed', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2.0">2.0x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communication Settings */}
        <TabsContent value="communication" className="space-y-6">
          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-pink-500/20 via-rose-400/15 to-red-500/20 backdrop-blur-xl border border-pink-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:-rotate-0.5 hover:shadow-2xl hover:shadow-pink-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  <Smartphone className="h-5 w-5" />
                  Communication Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you interact with other users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Video Calls</Label>
                    <p className="text-sm text-gray-500">Let others start video calls with you</p>
                  </div>
                  <Switch
                    checked={settings.allowVideoCall}
                    onCheckedChange={(checked) => updateSetting('allowVideoCall', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Voice Calls</Label>
                    <p className="text-sm text-gray-500">Let others start voice calls with you</p>
                  </div>
                  <Switch
                    checked={settings.allowVoiceCall}
                    onCheckedChange={(checked) => updateSetting('allowVoiceCall', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Allow Screen Share</Label>
                    <p className="text-sm text-gray-500">Allow screen sharing during calls</p>
                  </div>
                  <Switch
                    checked={settings.allowScreenShare}
                    onCheckedChange={(checked) => updateSetting('allowScreenShare', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Meeting Duration (minutes)</Label>
                  <Select
                    value={settings.defaultMeetingDuration.toString()}
                    onValueChange={(value) =>
                      updateSetting('defaultMeetingDuration', parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group perspective-1000">
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/20 via-orange-400/15 to-yellow-500/20 backdrop-blur-xl border border-red-400/30 shadow-xl transition-all duration-500 hover:scale-[1.01] hover:rotate-0.5 hover:shadow-2xl hover:shadow-red-500/25 transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Data Management
                </CardTitle>
                <CardDescription>Export your data or delete your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>

                <Button onClick={deleteAccount} variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button onClick={saveSettings} disabled={isSaving} className="px-8">
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
