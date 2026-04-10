'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Bot,
  Settings,
  FolderOpen,
  Megaphone,
  Loader2,
  ShieldCheck,
  Ban,
  Trash2,
  Square,
  Save,
  Send,
  Search,
  ChevronDown,
  ChevronRight,
  File,
  Eye,
  Crown,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/* ───────────── Types ───────────── */

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  isBanned: boolean;
  ipAddress: string | null;
  maxBots: number;
  createdAt: string;
  _count: { bots: number };
}

interface AdminBot {
  id: string;
  name: string;
  language: string;
  status: string;
  createdAt: string;
  user: { email: string; name: string | null };
}

interface BotFileEntry {
  id: string;
  path: string;
  size: number;
  updatedAt: string;
}

interface FileTreeUser {
  userId: string;
  userName: string | null;
  userEmail: string;
  bots: {
    botId: string;
    botName: string;
    files: BotFileEntry[];
  }[];
}

/* ───────────── Framer Motion Variants ───────────── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, ease: 'easeOut' },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const cardHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: 0.2, ease: 'easeOut' } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ───────────── Helpers ───────────── */

const formatDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'yyyy/MM/dd HH:mm', { locale: ar });
  } catch {
    return '-';
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const planLabel = (plan: string) => {
  switch (plan) {
    case 'pro': return 'برو';
    case 'enterprise': return 'مؤسسات';
    default: return 'مجاني';
  }
};

const planVariant = (plan: string) => {
  switch (plan) {
    case 'pro': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'enterprise': return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
};

/* ───────────── Component ───────────── */

export default function DevAdmin() {
  const { user, setCurrentPage } = useAppStore();

  // ── State: Stats ──
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalBots: number;
    runningBots: number;
    proUsers: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // ── State: Users ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [planTarget, setPlanTarget] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState('free');
  const [changingPlan, setChangingPlan] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [togglingBan, setTogglingBan] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── State: Bots ──
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [loadingBots, setLoadingBots] = useState(false);
  const [stopTarget, setStopTarget] = useState<AdminBot | null>(null);
  const [stoppingBot, setStoppingBot] = useState(false);
  const [deleteBotTarget, setDeleteBotTarget] = useState<AdminBot | null>(null);
  const [deletingBot, setDeletingBot] = useState(false);

  // ── State: Platform Config ──
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const configFields = [
    { key: 'supportChannelUrl', label: 'رابط قناة الدعم', type: 'text', placeholder: 'https://t.me/...' },
    { key: 'announcementChannelUrl', label: 'رابط قناة الإعلانات', type: 'text', placeholder: 'https://t.me/...' },
    { key: 'developerContact', label: 'طريقة التواصل مع المطور', type: 'text', placeholder: ' Telegram أو البريد الإلكتروني' },
    { key: 'freePlanBots', label: 'عدد البوتات المجانية', type: 'number', placeholder: '2' },
    { key: 'proPlanBots', label: 'عدد بوتات البرو', type: 'number', placeholder: '10' },
    { key: 'enterprisePlanBots', label: 'عدد بوتات المؤسسات', type: 'number', placeholder: '50' },
    { key: 'freePlanPrice', label: 'سعر الخطة المجانية ($)', type: 'number', placeholder: '0' },
    { key: 'proPlanPrice', label: 'سعر خطة البرو ($)', type: 'number', placeholder: '9.99' },
    { key: 'enterprisePlanPrice', label: 'سعر خطة المؤسسات ($)', type: 'number', placeholder: '29.99' },
  ];

  // ── State: Files ──
  const [fileTree, setFileTree] = useState<FileTreeUser[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedBots, setExpandedBots] = useState<Set<string>>(new Set());

  // ── State: Announcements ──
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  /* ──────── Data Fetching ──────── */

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/stats', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' }),
      ]);
      if (statsRes.ok && usersRes.ok) {
        const statsData = await statsRes.json();
        const usersData: AdminUser[] = await usersRes.json();
        setStats({
          totalUsers: statsData.totalUsers ?? usersData.length,
          totalBots: statsData.totalBots ?? 0,
          runningBots: statsData.runningBots ?? 0,
          proUsers: usersData.filter((u) => u.plan === 'pro' || u.plan === 'enterprise').length,
        });
      }
    } catch {
      // Silent
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      // Silent
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchBots = useCallback(async () => {
    setLoadingBots(true);
    try {
      // Admin can fetch all bots — use a dedicated approach
      const usersRes = await fetch('/api/users', { credentials: 'include' });
      if (!usersRes.ok) return;
      const usersData: AdminUser[] = await usersRes.json();

      const allBots: AdminBot[] = [];
      for (const u of usersData) {
        try {
          const detailRes = await fetch(`/api/users/${u.id}`, { credentials: 'include' });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (Array.isArray(detail.bots)) {
              for (const b of detail.bots) {
                allBots.push({
                  id: b.id,
                  name: b.name,
                  language: b.language,
                  status: b.status,
                  createdAt: b.createdAt,
                  user: { email: u.email, name: u.name },
                });
              }
            }
          }
        } catch {
          // Skip this user's bots
        }
      }
      setBots(allBots);
    } catch {
      // Silent
    } finally {
      setLoadingBots(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/platform-config', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {
      // Silent
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const usersRes = await fetch('/api/users', { credentials: 'include' });
      if (!usersRes.ok) return;
      const usersData: AdminUser[] = await usersRes.json();

      const tree: FileTreeUser[] = [];
      for (const u of usersData) {
        try {
          const detailRes = await fetch(`/api/users/${u.id}`, { credentials: 'include' });
          if (!detailRes.ok) continue;
          const detail = await detailRes.json();
          if (!Array.isArray(detail.bots) || detail.bots.length === 0) continue;

          const userBots: FileTreeUser['bots'] = [];
          for (const b of detail.bots) {
            if (!b._count || b._count.files === 0) continue;
            try {
              const filesRes = await fetch(`/api/bots/${b.id}/files`, { credentials: 'include' });
              if (filesRes.ok) {
                const filesData: BotFileEntry[] = await filesRes.json();
                if (filesData.length > 0) {
                  userBots.push({
                    botId: b.id,
                    botName: b.name,
                    files: filesData,
                  });
                }
              }
            } catch {
              // Skip this bot's files
            }
          }
          if (userBots.length > 0) {
            tree.push({
              userId: u.id,
              userName: u.name,
              userEmail: u.email,
              bots: userBots,
            });
          }
        } catch {
          // Skip this user
        }
      }
      setFileTree(tree);
    } catch {
      // Silent
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'developer' || user?.role === 'admin') {
      fetchStats();
      fetchUsers();
    }
  }, [user?.role, fetchStats, fetchUsers]);

  /* ──────── Actions ──────── */

  const handleChangePlan = async () => {
    if (!planTarget) return;
    setChangingPlan(true);
    try {
      const res = await fetch(`/api/users/${planTarget.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changePlan', plan: newPlan }),
      });
      if (res.ok) {
        toast.success(`تم تغيير خطة ${planTarget.email} إلى ${planLabel(newPlan)}`);
        setPlanTarget(null);
        await fetchUsers();
        await fetchStats();
      } else {
        throw new Error('فشل في تغيير الخطة');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setChangingPlan(false);
    }
  };

  const handleToggleBan = async (target: AdminUser) => {
    setTogglingBan(true);
    try {
      const res = await fetch(`/api/users/${target.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !target.isBanned }),
      });
      if (res.ok) {
        toast.success(target.isBanned ? `تم تفعيل حساب ${target.email}` : `تم حظر حساب ${target.email}`);
        setBanTarget(null);
        await fetchUsers();
      } else {
        throw new Error('فشل في تنفيذ العملية');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setTogglingBan(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`تم حذف المستخدم ${deleteTarget.email}`);
        setDeleteTarget(null);
        await fetchUsers();
        await fetchStats();
      } else {
        throw new Error('فشل في حذف المستخدم');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleForceStopBot = async () => {
    if (!stopTarget) return;
    setStoppingBot(true);
    try {
      const res = await fetch(`/api/bots/${stopTarget.id}/stop`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`تم إيقاف البوت "${stopTarget.name}"`);
        setStopTarget(null);
        await fetchBots();
        await fetchStats();
      } else {
        throw new Error('فشل في إيقاف البوت');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setStoppingBot(false);
    }
  };

  const handleDeleteBot = async () => {
    if (!deleteBotTarget) return;
    setDeletingBot(true);
    try {
      const res = await fetch(`/api/bots/${deleteBotTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`تم حذف البوت "${deleteBotTarget.name}"`);
        setDeleteBotTarget(null);
        await fetchBots();
        await fetchStats();
      } else {
        throw new Error('فشل في حذف البوت');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setDeletingBot(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await Promise.all(
        configFields.map(async (field) => {
          const val = config[field.key] ?? '';
          await fetch('/api/platform-config', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: field.key, value: val }),
          });
        })
      );
      toast.success('تم حفظ إعدادات المنصة بنجاح');
    } catch {
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleBroadcast = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }
    setSendingAnnouncement(true);
    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMessage,
          type: 'announcement',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`تم إرسال الإعلان إلى ${data.count} مستخدم`);
        setAnnouncementTitle('');
        setAnnouncementMessage('');
      } else {
        throw new Error('فشل في إرسال الإعلان');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleBotExpand = (botId: string) => {
    setExpandedBots((prev) => {
      const next = new Set(prev);
      if (next.has(botId)) next.delete(botId);
      else next.add(botId);
      return next;
    });
  };

  /* ──────── Filtered Users ──────── */
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q);
  });

  /* ──────── Access Guard ──────── */
  if (!user || (user.role !== 'developer' && user.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <ShieldCheck className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-muted-foreground text-lg">ليس لديك صلاحيات المطور</p>
        <Button variant="outline" onClick={() => setCurrentPage('dashboard')}>
          العودة للوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 h-full"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <img
            src="https://f.top4top.io/p_37210bgwm1.jpg"
            alt="استضافة الذئب"
            className="w-6 h-6 rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">لوحة تحكم المطور</h1>
          <p className="text-xs text-muted-foreground">تحكم كامل بجميع أجزاء المنصة</p>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" dir="rtl" className="flex-1">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5 ml-1.5" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 ml-1.5" />
            المستخدمين
          </TabsTrigger>
          <TabsTrigger value="bots" className="text-xs sm:text-sm">
            <Bot className="h-3.5 w-3.5 ml-1.5" />
            البوتات
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5 ml-1.5" />
            الإعدادات
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs sm:text-sm">
            <FolderOpen className="h-3.5 w-3.5 ml-1.5" />
            الملفات
          </TabsTrigger>
          <TabsTrigger value="announcements" className="text-xs sm:text-sm">
            <Megaphone className="h-3.5 w-3.5 ml-1.5" />
            الإعلانات
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        <TabsContent value="overview" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">إجمالي المستخدمين</p>
                      <p className="text-3xl font-bold">
                        {loadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin inline text-primary" />
                        ) : (
                          stats?.totalUsers ?? '-'
                        )}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Bots */}
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">إجمالي البوتات</p>
                      <p className="text-3xl font-bold">
                        {loadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin inline text-primary" />
                        ) : (
                          stats?.totalBots ?? '-'
                        )}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Bots */}
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">البوتات النشطة</p>
                      <p className="text-3xl font-bold text-emerald-400">
                        {loadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin inline" />
                        ) : (
                          stats?.runningBots ?? '-'
                        )}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pro Users */}
              <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">مستخدمي البرو</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {loadingStats ? (
                          <Loader2 className="h-6 w-6 animate-spin inline" />
                        ) : (
                          stats?.proUsers ?? '-'
                        )}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Summary */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  ملخص سريع
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">مستخدمين نشطين</span>
                      <span className="font-medium">{users.filter((u) => !u.isBanned).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">حسابات محظورة</span>
                      <span className="font-medium text-red-400">{users.filter((u) => u.isBanned).length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">خطة مجانية</span>
                      <span className="font-medium">{users.filter((u) => u.plan === 'free').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">خطة برو</span>
                      <span className="font-medium text-blue-400">{users.filter((u) => u.plan === 'pro').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">خطة مؤسسات</span>
                      <span className="font-medium text-cyan-400">{users.filter((u) => u.plan === 'enterprise').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">مطورين / مديرين</span>
                      <span className="font-medium text-primary">{users.filter((u) => u.role === 'developer' || u.role === 'admin').length}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ USERS TAB ═══════════════ */}
        <TabsContent value="users" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  إدارة المستخدمين
                </CardTitle>
                <CardDescription>عرض وإدارة جميع المستخدمين في المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pr-10 h-9"
                    dir="ltr"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {loadingUsers ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground text-sm">لا يوجد مستخدمين</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">الاسم</TableHead>
                          <TableHead className="text-xs">البريد</TableHead>
                          <TableHead className="text-xs">الخطة</TableHead>
                          <TableHead className="text-xs">الدور</TableHead>
                          <TableHead className="text-xs text-center">البوتات</TableHead>
                          <TableHead className="text-xs">الحالة</TableHead>
                          <TableHead className="text-xs">التاريخ</TableHead>
                          <TableHead className="text-xs text-left">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="text-sm font-medium">{u.name || '-'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground" dir="ltr">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-[10px] ${planVariant(u.plan)}`}>
                                {planLabel(u.plan)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={u.role === 'developer' || u.role === 'admin' ? 'default' : 'secondary'}
                                className="text-[10px]"
                              >
                                {u.role === 'developer' ? 'مطور' : u.role === 'admin' ? 'مدير' : 'مستخدم'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm">{u._count?.bots ?? 0}</TableCell>
                            <TableCell>
                              {u.isBanned ? (
                                <Badge variant="destructive" className="text-[10px]">محظور</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">نشط</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-1">
                                {/* Change Plan */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => { setPlanTarget(u); setNewPlan(u.plan); }}
                                  className="h-7 text-xs text-blue-400 hover:text-blue-300"
                                  title="تغيير الخطة"
                                >
                                  <Crown className="h-3.5 w-3.5" />
                                </Button>
                                {/* Ban/Unban */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setBanTarget(u)}
                                  className={`h-7 text-xs ${u.isBanned ? 'text-emerald-400 hover:text-emerald-300' : 'text-red-400 hover:text-red-300'}`}
                                  title={u.isBanned ? 'إلغاء الحظر' : 'حظر'}
                                >
                                  {u.isBanned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                </Button>
                                {/* Delete */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteTarget(u)}
                                  className="h-7 text-xs text-red-400 hover:text-red-300"
                                  title="حذف"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ BOTS TAB ═══════════════ */}
        <TabsContent value="bots" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      إدارة البوتات
                    </CardTitle>
                    <CardDescription>جميع البوتات في المنصة ({bots.length})</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { fetchBots(); toast.info('جارٍ تحديث قائمة البوتات...'); }}
                    className="text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 ml-1" />
                    تحديث
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingBots ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : bots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Bot className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">لا يوجد بوتات حالياً</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">اسم البوت</TableHead>
                          <TableHead className="text-xs">المالك</TableHead>
                          <TableHead className="text-xs">اللغة</TableHead>
                          <TableHead className="text-xs">الحالة</TableHead>
                          <TableHead className="text-xs">التاريخ</TableHead>
                          <TableHead className="text-xs text-left">الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bots.map((b) => (
                          <TableRow key={b.id}>
                            <TableCell className="text-sm font-medium">{b.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground" dir="ltr">
                              {b.user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-[10px]">{b.language}</Badge>
                            </TableCell>
                            <TableCell>
                              {b.status === 'running' ? (
                                <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                                  نشط
                                </Badge>
                              ) : b.status === 'error' ? (
                                <Badge variant="destructive" className="text-[10px]">خطأ</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-500/30">
                                  متوقف
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</TableCell>
                            <TableCell className="text-left">
                              <div className="flex items-center gap-1">
                                {b.status === 'running' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setStopTarget(b)}
                                    className="h-7 text-xs text-red-400 hover:text-red-300"
                                    title="إيقاف قسري"
                                  >
                                    <Square className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteBotTarget(b)}
                                  className="h-7 text-xs text-red-400 hover:text-red-300"
                                  title="حذف البوت"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ CONFIG TAB ═══════════════ */}
        <TabsContent value="config" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  إعدادات المنصة
                </CardTitle>
                <CardDescription>إدارة تكوين المنصة والخطط والأسعار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {loadingConfig ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Links Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-primary" />
                        الروابط والقنوات
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {configFields.filter((f) => f.type === 'text').map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{field.label}</Label>
                            <Input
                              value={config[field.key] ?? ''}
                              onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              dir="ltr"
                              className="h-9 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Plans Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        إعدادات الخطط
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Free Plan */}
                        <motion.div
                          variants={cardHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="rounded-xl border border-border/50 bg-card/40 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-slate-400" />
                            </div>
                            <span className="text-sm font-semibold">الخطة المجانية</span>
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">عدد البوتات</Label>
                              <Input
                                type="number"
                                value={config.freePlanBots ?? '2'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, freePlanBots: e.target.value }))}
                                className="h-9 text-sm"
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">السعر ($)</Label>
                              <Input
                                type="number"
                                value={config.freePlanPrice ?? '0'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, freePlanPrice: e.target.value }))}
                                className="h-9 text-sm"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                          variants={cardHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Crown className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-sm font-semibold text-blue-400">خطة البرو</span>
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">عدد البوتات</Label>
                              <Input
                                type="number"
                                value={config.proPlanBots ?? '10'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, proPlanBots: e.target.value }))}
                                className="h-9 text-sm border-blue-500/20"
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">السعر ($)</Label>
                              <Input
                                type="number"
                                value={config.proPlanPrice ?? '9.99'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, proPlanPrice: e.target.value }))}
                                className="h-9 text-sm border-blue-500/20"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Enterprise Plan */}
                        <motion.div
                          variants={cardHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-cyan-400" />
                            </div>
                            <span className="text-sm font-semibold text-cyan-400">خطة المؤسسات</span>
                          </div>
                          <div className="space-y-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">عدد البوتات</Label>
                              <Input
                                type="number"
                                value={config.enterprisePlanBots ?? '50'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, enterprisePlanBots: e.target.value }))}
                                className="h-9 text-sm border-cyan-500/20"
                                dir="ltr"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">السعر ($)</Label>
                              <Input
                                type="number"
                                value={config.enterprisePlanPrice ?? '29.99'}
                                onChange={(e) => setConfig((prev) => ({ ...prev, enterprisePlanPrice: e.target.value }))}
                                className="h-9 text-sm border-cyan-500/20"
                                dir="ltr"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {savingConfig ? (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 ml-2" />
                        )}
                        حفظ الإعدادات
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ FILES TAB ═══════════════ */}
        <TabsContent value="files" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      مستعرض الملفات
                    </CardTitle>
                    <CardDescription>جميع ملفات البوتات (للقراءة فقط)</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { fetchFiles(); toast.info('جارٍ تحديث الملفات...'); }}
                    className="text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 ml-1" />
                    تحديث
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : fileTree.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">لا يوجد ملفات حالياً</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <div className="space-y-2">
                      {fileTree.map((userNode) => (
                        <div key={userNode.userId} className="border border-border/30 rounded-lg overflow-hidden">
                          {/* User Header */}
                          <button
                            onClick={() => toggleUserExpand(userNode.userId)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent/30 transition-colors"
                          >
                            {expandedUsers.has(userNode.userId) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <Users className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-right flex-1 truncate">
                              {userNode.userName || userNode.userEmail}
                            </span>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {userNode.bots.reduce((sum, b) => sum + b.files.length, 0)} ملف
                            </Badge>
                          </button>

                          {/* User's Bots */}
                          {expandedUsers.has(userNode.userId) && (
                            <div className="border-t border-border/20">
                              {userNode.bots.map((botNode) => (
                                <div key={botNode.botId} className="border-b border-border/10 last:border-b-0">
                                  {/* Bot Header */}
                                  <button
                                    onClick={() => toggleBotExpand(botNode.botId)}
                                    className="w-full flex items-center gap-2 px-3 py-2 pr-10 hover:bg-accent/20 transition-colors"
                                  >
                                    {expandedBots.has(botNode.botId) ? (
                                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                    )}
                                    <Bot className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                    <span className="text-xs font-medium text-right flex-1 truncate">
                                      {botNode.botName}
                                    </span>
                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                      {botNode.files.length}
                                    </Badge>
                                  </button>

                                  {/* Bot's Files */}
                                  {expandedBots.has(botNode.botId) && (
                                    <div className="pr-10">
                                      {botNode.files.map((file) => (
                                        <div
                                          key={file.id}
                                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/10 transition-colors"
                                        >
                                          <File className="h-3 w-3 text-muted-foreground shrink-0" />
                                          <span className="text-xs text-muted-foreground flex-1 truncate" dir="ltr">
                                            {file.path}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                            {formatBytes(file.size)}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground/60 shrink-0">
                                            {formatDate(file.updatedAt)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ═══════════════ ANNOUNCEMENTS TAB ═══════════════ */}
        <TabsContent value="announcements" className="mt-4">
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  نظام الإعلانات
                </CardTitle>
                <CardDescription>إرسال إعلان لجميع مستخدمي المنصة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">عنوان الإعلان</Label>
                  <Input
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="مثال: تحديث جديد للمنصة"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">نص الإعلان</Label>
                  <Textarea
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="اكتب نص الإعلان هنا..."
                    rows={5}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <ShieldCheck className="h-4 w-4 text-yellow-400 shrink-0" />
                  <p className="text-xs text-yellow-400/80">
                    سيتم إرسال هذا الإعلان إلى جميع المستخدمين المسجلين في المنصة كإشعار.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleBroadcast}
                    disabled={sendingAnnouncement || !announcementTitle.trim() || !announcementMessage.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {sendingAnnouncement ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 ml-2" />
                    )}
                    إرسال للجميع
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* ═══════════════ DIALOGS ═══════════════ */}

      {/* Change Plan Dialog */}
      <AlertDialog open={!!planTarget} onOpenChange={() => setPlanTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              تغيير خطة المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription>
              تغيير خطة <span className="font-medium text-foreground" dir="ltr">{planTarget?.email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-sm mb-2 block">الخطة الجديدة</Label>
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">مجانية</SelectItem>
                <SelectItem value="pro">برو</SelectItem>
                <SelectItem value="enterprise">مؤسسات</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={changingPlan}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePlan}
              disabled={changingPlan || newPlan === planTarget?.plan}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {changingPlan && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              تأكيد التغيير
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban/Unban Dialog */}
      <AlertDialog open={!!banTarget} onOpenChange={() => setBanTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.isBanned ? 'إلغاء حظر الحساب' : 'حظر الحساب'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.isBanned
                ? `هل تريد إلغاء حظر حساب ${banTarget?.email}؟`
                : `هل تريد حظر حساب ${banTarget?.email}؟ سيتم إيقاف جميع بوتات المستخدم.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={togglingBan}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banTarget && handleToggleBan(banTarget)}
              disabled={togglingBan}
              className={banTarget?.isBanned ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'}
            >
              {togglingBan && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              {banTarget?.isBanned ? 'إلغاء الحظر' : 'حظر'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المستخدم &quot;{deleteTarget?.email}&quot؛؟ سيتم حذف جميع بوتاته وملفاته وسجلاته نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Stop Bot Dialog */}
      <AlertDialog open={!!stopTarget} onOpenChange={() => setStopTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>إيقاف قسري للبوت</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إيقاف البوت &quot;{stopTarget?.name}&quot؛ قسرياً؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={stoppingBot}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceStopBot}
              disabled={stoppingBot}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {stoppingBot && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              إيقاف قسري
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Bot Dialog */}
      <AlertDialog open={!!deleteBotTarget} onOpenChange={() => setDeleteBotTarget(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">حذف البوت</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف البوت &quot;{deleteBotTarget?.name}&quot؛؟ سيتم حذف جميع ملفاته وسجلاته نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deletingBot}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBot}
              disabled={deletingBot}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingBot && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حذف نهائياً
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
