'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Mail,
  Calendar,
  Crown,
  Camera,
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
import { motion, type Variants } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: string;
  role: string;
  createdAt: string;
}

interface UserStats {
  totalBots: number;
  maxBots: number;
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'مجاني', color: 'bg-muted text-muted-foreground border-border' },
  pro: { label: 'احترافي', color: 'bg-primary/15 text-primary border-primary/30' },
  enterprise: { label: 'مؤسسات', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

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
    { label: 'ضعيف', color: 'bg-red-400' },
    { label: 'متوسط', color: 'bg-blue-500' },
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

const sectionHeaderVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function AccountSettings() {
  const { user, setUser } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile from API
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Personal info
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

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

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setAvatarUrl(data.avatarUrl);
      }
    } catch {
      // silent
    } finally {
      setLoadingProfile(false);
    }
  }, []);

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
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success('تم تحديث الاسم بنجاح');
        const data = await res.json();
        setProfile(data);
        if (user) setUser({ ...user, name: data.name });
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 500 كيلوبايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setSavingAvatar(true);
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: base64 }),
        });

        if (res.ok) {
          const data = await res.json();
          setAvatarUrl(data.avatarUrl);
          setProfile(data);
          if (user) setUser({ ...user, avatarUrl: data.avatarUrl });
          toast.success('تم تحديث الصورة الشخصية بنجاح');
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'فشل في تحديث الصورة');
        }
      } catch (err: unknown) {
        if (err instanceof Error) toast.error(err.message);
        else toast.error('حدث خطأ');
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
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
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      const res = await fetch('/api/user/profile', {
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
  const displayName = profile?.name || user?.name || 'مستخدم';
  const displayEmail = profile?.email || user?.email || '';
  const displayPlan = profile?.plan || user?.plan || 'free';
  const displayRole = profile?.role || user?.role || '';
  const displayAvatar = avatarUrl || profile?.avatarUrl || user?.avatarUrl || null;

  /* ─── Gradient Section Divider ─── */
  function SectionDivider({ icon: Icon, label, danger }: { icon: typeof Mail; label: string; danger?: boolean }) {
    return (
      <motion.div variants={sectionHeaderVariants} className="flex items-center gap-3">
        <div className={`flex-1 h-px ${danger ? 'bg-gradient-to-l from-red-500/20 via-red-500/10 to-transparent' : 'bg-gradient-to-l from-primary/20 via-primary/10 to-transparent'}`} />
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${danger ? 'text-red-400/60 bg-red-500/5 border border-red-500/10' : 'text-primary/60 bg-primary/5 border border-primary/10'}`}>
          <Icon className="size-3" />
          <span className="text-[10px] font-medium">{label}</span>
        </div>
        <div className={`flex-1 h-px ${danger ? 'bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent' : 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent'}`} />
      </motion.div>
    );
  }

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

      {/* ─── Gradient Profile Card ─── */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative bg-gradient-to-l from-primary/15 via-primary/5 to-transparent p-6">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl translate-x-1/4 translate-y-1/4" />
            <div className="relative flex items-center gap-4">
              {/* Avatar */}
              <div className="relative group">
                <motion.div
                  className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-blue-500 to-primary opacity-60 blur-sm"
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary/80 via-blue-400 to-primary/80" />
                <button
                  type="button"
                  className="relative"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={savingAvatar}
                >
                  <Avatar className="relative h-16 w-16 border-2 border-background">
                    {displayAvatar && (
                      <AvatarImage src={displayAvatar} alt={displayName} />
                    )}
                    <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {savingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Loader2 className="size-5 text-white animate-spin" />
                    </div>
                  )}
                  {!savingAvatar && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <motion.div
                  className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  {displayRole === 'admin' && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                      <Crown className="h-3 w-3" />
                      مدير
                    </Badge>
                  )}
                  <Badge variant="outline" className={PLAN_LABELS[displayPlan]?.color || PLAN_LABELS.free.color}>
                    {PLAN_LABELS[displayPlan]?.label || 'مجاني'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1" dir="ltr">
                  <Mail className="h-3.5 w-3.5" />
                  {displayEmail || '—'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {profile?.createdAt
                      ? `عضو منذ ${new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'short' }).format(new Date(profile.createdAt))}`
                      : 'عضو منذ الآن'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── Personal Info ─── */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 border-r-2 border-r-primary/40">
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
                value={displayEmail}
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
                  disabled={savingName || name === (profile?.name || '')}
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

            {/* Plan info */}
            <div className="space-y-2">
              <Label>الخطة الحالية</Label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <Badge variant="outline" className={PLAN_LABELS[displayPlan]?.color || PLAN_LABELS.free.color}>
                  {PLAN_LABELS[displayPlan]?.label || 'مجاني'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  للتطوير تواصل مع المطور
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Section Divider: Security ─── */}
      <SectionDivider icon={Shield} label="الأمان" />

      {/* ─── Security ─── */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 border-r-2 border-r-red-400/30">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    <motion.span
                      key={passwordStrength.label}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className={`text-xs font-medium ${
                        passwordStrength.score <= 1
                          ? 'text-red-400'
                          : passwordStrength.score <= 2
                          ? 'text-red-300'
                          : passwordStrength.score <= 3
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {passwordStrength.label}
                    </motion.span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      key={passwordStrength.color}
                      className={`h-full rounded-full ${passwordStrength.color}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(passwordStrength.score * 20, 10)}%`,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                  <ul className="space-y-0.5 mt-1">
                    <li
                      className={`text-[10px] flex items-center gap-1 transition-colors duration-200 ${
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
                      className={`text-[10px] flex items-center gap-1 transition-colors duration-200 ${
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
                      className={`text-[10px] flex items-center gap-1 transition-colors duration-200 ${
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
                      className={`text-[10px] flex items-center gap-1 transition-colors duration-200 ${
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingPassword && (
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              )}
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Section Divider: Limits ─── */}
      <SectionDivider icon={Gauge} label="الحدود" />

      {/* ─── Limits ─── */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 border-r-2 border-r-emerald-400/30">
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
                    stats?.maxBots ?? '...'
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

      {/* ─── Section Divider: Danger Zone ─── */}
      <SectionDivider icon={AlertTriangle} label="منطقة الخطر" danger />

      {/* ─── Danger Zone - Delete Account ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-destructive/30 hover:border-destructive/50 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-red-500/3 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <CardHeader className="relative">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                >
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </motion.div>
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
          <CardContent className="relative">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-shadow duration-300">
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
