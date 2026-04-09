'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Shield,
  Gauge,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Bell,
  Mail,
  Calendar,
  Crown,
  Link2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserStats {
  totalBots: number;
  maxBots: number;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const strengths = [
    { label: 'ضعيف جداً', color: 'bg-red-500' },
    { label: 'ضعيف', color: 'bg-orange-500' },
    { label: 'متوسط', color: 'bg-amber-500' },
    { label: 'قوي', color: 'bg-emerald-500' },
    { label: 'قوي جداً', color: 'bg-emerald-400' },
  ];

  const index = Math.min(score, strengths.length) - 1;
  return {
    score,
    label: strengths[Math.max(0, index)].label,
    color: strengths[Math.max(0, index)].color,
  };
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

// Mock notification preferences
const mockNotifications = [
  { id: '1', label: 'إشعارات البريد الإلكتروني', description: 'تلقي إشعارات عبر البريد عند أحداث البوت', defaultChecked: true },
  { id: '2', label: 'إشعارات الأخطاء', description: 'تنبيه عند حدوث خطأ في أي بوت', defaultChecked: true },
  { id: '3', label: 'تحديثات النظام', description: 'إشعارات حول التحديثات والصيانة', defaultChecked: false },
  { id: '4', label: 'النشاط التسويقي', description: 'عروض وأخبار المنصة', defaultChecked: false },
];

// Mock connected accounts
const mockConnectedAccounts = [
  { id: 'telegram', name: 'Telegram', description: 'مرتبط منذ 15 يوماً', icon: Send, color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30', connected: true },
  { id: 'github', name: 'GitHub', description: 'غير مرتبط', icon: Crown, color: 'text-muted-foreground', bgColor: 'bg-muted/50', borderColor: 'border-border/50', connected: false },
];

export default function AccountSettings() {
  const { user, setUser } = useAppStore();

  // Personal info
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Delete account
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Notification toggles
  const [notifications, setNotifications] = useState(
    () => mockNotifications.map((n) => ({ ...n, enabled: n.defaultChecked }))
  );

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silent fail for stats
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success('تم تحديث الاسم بنجاح');
        setUser({ ...user!, name });
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في تحديث الاسم');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء التحديث');
      else toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'changePassword',
          currentPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success('تم تغيير كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في تغيير كلمة المرور');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      else toast.error('حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'حذف حسابي') {
      toast.error('يرجى كتابة "حذف حسابي" للتأكيد');
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('تم حذف الحساب بنجاح');
        setUser(null);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في حذف الحساب');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || 'حدث خطأ أثناء حذف الحساب');
      else toast.error('حدث خطأ أثناء حذف الحساب');
    } finally {
      setDeleting(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <motion.div
      className="flex flex-col gap-6 p-4 max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold gradient-text">الإعدادات</h1>
      </motion.div>

      {/* Gradient Profile Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 overflow-hidden">
          <div className="relative bg-gradient-to-l from-primary/15 via-primary/5 to-transparent p-6">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl translate-x-1/4 translate-y-1/4" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'م'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{user?.name || 'مستخدم'}</h2>
                  {user?.role === 'admin' && (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1">
                      <Crown className="h-3 w-3" />
                      مدير
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1" dir="ltr">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email || '—'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    انضم منذ 15 يوماً
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Profile Completion Progress Bar */}
          <CardContent className="p-4 pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>اكتمال الملف الشخصي</span>
              <span className="font-medium text-primary">75%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-l from-primary to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 0.5, duration: 1, type: 'tween' as const, ease: 'easeOut' as const }}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1 text-emerald-400"><Check className="h-3 w-3" /> البريد الإلكتروني</span>
              <span className="flex items-center gap-1 text-emerald-400"><Check className="h-3 w-3" /> الاسم</span>
              <span className="flex items-center gap-1 text-amber-400"><X className="h-3 w-3" /> الصورة الشخصية</span>
              <span className="flex items-center gap-1 text-amber-400"><X className="h-3 w-3" /> الهاتف</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">المعلومات الشخصية</CardTitle>
                <CardDescription>إدارة معلومات حسابك الشخصية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted/50 cursor-not-allowed"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                البريد الإلكتروني لا يمكن تغييره
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="focus-within:ring-amber-500/30"
                />
                <Button
                  onClick={handleSaveName}
                  disabled={savingName || name === user?.name}
                  size="default"
                  className="shrink-0"
                >
                  {savingName ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 ml-2" />
                  )}
                  حفظ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bell className="h-3 w-3" />
          الإشعارات
        </div>
        <Separator className="flex-1" />
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">تفضيلات الإشعارات</CardTitle>
                <CardDescription>تحكم في نوع الإشعارات التي تتلقاها</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05, type: 'tween' as const, ease: 'easeOut' as const, duration: 0.2 }}
              >
                <div>
                  <p className="text-sm font-medium">{notif.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                </div>
                <Switch
                  checked={notif.enabled}
                  onCheckedChange={(checked) => {
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notif.id ? { ...n, enabled: checked } : n))
                    );
                    toast.success(checked ? `تم تفعيل "${notif.label}"` : `تم تعطيل "${notif.label}"`);
                  }}
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" />
          الحسابات المرتبطة
        </div>
        <Separator className="flex-1" />
      </motion.div>

      {/* Connected Accounts */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-base">الحسابات المرتبطة</CardTitle>
                <CardDescription>ربط حساباتك الأخرى لتحسين التجربة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockConnectedAccounts.map((account, i) => (
              <motion.div
                key={account.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${account.borderColor} ${account.bgColor} hover:scale-[1.01] transition-transform`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring' as const, stiffness: 260, damping: 24 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${account.bgColor} flex items-center justify-center`}>
                    <account.icon className={`h-5 w-5 ${account.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {account.name}
                      {account.connected && (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          متصل
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{account.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={account.connected ? 'outline' : 'default'}
                  className={`text-xs ${account.connected ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : ''}`}
                  onClick={() => {
                    toast.success(account.connected ? `تم فصل ${account.name}` : `تم ربط ${account.name}`);
                  }}
                >
                  {account.connected ? 'فصل' : 'ربط'}
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          الأمان
        </div>
        <Separator className="flex-1" />
      </motion.div>

      {/* Security */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-base">الأمان</CardTitle>
                <CardDescription>تغيير كلمة المرور وإعدادات الأمان</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      قوة كلمة المرور
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.score <= 1
                          ? 'text-red-400'
                          : passwordStrength.score <= 2
                          ? 'text-orange-400'
                          : passwordStrength.score <= 3
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${Math.max(passwordStrength.score * 20, 10)}%`,
                      }}
                    />
                  </div>
                  <ul className="space-y-0.5 mt-1">
                    <li
                      className={`text-[10px] flex items-center gap-1 ${
                        newPassword.length >= 8
                          ? 'text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {newPassword.length >= 8 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      8 أحرف على الأقل
                    </li>
                    <li
                      className={`text-[10px] flex items-center gap-1 ${
                        /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      أحرف كبيرة وصغيرة
                    </li>
                    <li
                      className={`text-[10px] flex items-center gap-1 ${
                        /\d/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {/\d/.test(newPassword) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      أرقام
                    </li>
                    <li
                      className={`text-[10px] flex items-center gap-1 ${
                        /[^a-zA-Z0-9]/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {/[^a-zA-Z0-9]/.test(newPassword) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      رموز خاصة
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور الجديدة"
              />
              {confirmPassword &&
                newPassword !== confirmPassword && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    كلمتا المرور غير متطابقتين
                  </p>
                )}
              {confirmPassword &&
                newPassword === confirmPassword && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    متطابقتان
                  </p>
                )}
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full"
            >
              {savingPassword && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Gauge className="h-3 w-3" />
          الحدود
        </div>
        <Separator className="flex-1" />
      </motion.div>

      {/* Limits */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Gauge className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base">الحدود</CardTitle>
                <CardDescription>معلومات عن حدود حسابك</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  عدد البوتات المسموح
                </p>
                <p className="text-2xl font-bold text-primary">
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    stats?.maxBots ?? user?.id ? '...' : '-'
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  عدد البوتات الحالي
                </p>
                <p className="text-2xl font-bold">
                  {loadingStats ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    stats?.totalBots ?? '...'
                  )}
                </p>
              </div>
            </div>

            {stats && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>الاستخدام</span>
                  <span>
                    {stats.totalBots} / {stats.maxBots}
                  </span>
                </div>
                <Progress
                  value={(stats.totalBots / stats.maxBots) * 100}
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-1.5 text-xs text-red-400/60">
          <AlertTriangle className="h-3 w-3" />
          منطقة الخطر
        </div>
        <Separator className="flex-1" />
      </motion.div>

      {/* Danger Zone - Delete Account */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <CardTitle className="text-base text-destructive">
                  منطقة الخطر
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع
                  بوتاتك وملفاتك وسجلاتك نهائياً.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full shadow-lg shadow-red-500/10">
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف حسابي نهائياً
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/50 bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    هل أنت متأكد تماماً؟
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3">
                      <p>
                        سيتم حذف حسابك وجميع بياناتك بشكل نهائي. لا يمكن
                        التراجع عن هذا الإجراء.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          اكتب &quot;حذف حسابي&quot; للتأكيد:
                        </p>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder="حذف حسابي"
                          className="text-center border-red-500/30 focus-within:ring-red-500/30"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel disabled={deleting}>
                    إلغاء
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== 'حذف حسابي'}
                    className="bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-red-500/20"
                  >
                    {deleting && (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    )}
                    تأكيد الحذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
