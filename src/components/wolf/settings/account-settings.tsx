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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التحديث');
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
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
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
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء حذف الحساب');
    } finally {
      setDeleting(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold gradient-text">الإعدادات</h1>

      {/* Personal Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            المعلومات الشخصية
          </CardTitle>
          <CardDescription>إدارة معلومات حسابك الشخصية</CardDescription>
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

      {/* Security */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" />
            الأمان
          </CardTitle>
          <CardDescription>تغيير كلمة المرور وإعدادات الأمان</CardDescription>
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

      {/* Limits */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-5 w-5 text-primary" />
            الحدود
          </CardTitle>
          <CardDescription>معلومات عن حدود حسابك</CardDescription>
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

      {/* Delete Account */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertTriangle className="h-5 w-5" />
            حذف الحساب
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع
            بوتاتك وملفاتك وسجلاتك نهائياً.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 ml-2" />
                حذف حسابي نهائياً
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border/50 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
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
                        className="text-center"
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
                  className="bg-destructive text-white hover:bg-destructive/90"
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
    </div>
  );
}
