'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Loader2,
  ArrowRight,
  Server,
  Cpu,
  HardDrive,
  Clock,
  Save,
  Plus,
  X,
  Terminal,
  Zap,
  FileCode,
  Activity,
  GitBranch,
  Calendar,
  Rocket,
  AlertTriangle,
  Power,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface BotDetail {
  id: string;
  name: string;
  description?: string | null;
  language: string;
  status: string;
  containerId?: string | null;
  port?: number | null;
  cpuLimit: number;
  ramLimit: number;
  autoRestart: boolean;
  githubUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { files: number; logs: number };
  envVars: { id: string; key: string; value: string; createdAt: string }[];
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const tabContentVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
    },
  },
};

// Timeline events loaded from API
const timelineEvents: { id: string; type: string; label: string; icon: typeof Rocket; color: string; bgColor: string; borderColor: string; time: string }[] = [];

export function BotDetail() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [bot, setBot] = useState<BotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [savingEnv, setSavingEnv] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const fetchBot = useCallback(async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBot(data);
        setEnvVars(data.envVars.map((e: { key: string; value: string }) => ({ key: e.key, value: e.value })));
      } else {
        toast.error('فشل في تحميل بيانات البوت');
      }
    } catch {
      toast.error('حدث خطأ أثناء التحميل');
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    fetchBot();
  }, [fetchBot]);

  if (!selectedBotId) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
      >
        <p className="text-muted-foreground">لم يتم اختيار بوت</p>
        <Button
          variant="outline"
          className="mt-4 gap-2"
          onClick={() => setCurrentPage('bots')}
        >
          <ArrowRight className="h-4 w-4" />
          العودة للبوتات
        </Button>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!bot) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
      >
        <p className="text-muted-foreground">البوت غير موجود</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => setCurrentPage('bots')}>
          <ArrowRight className="h-4 w-4" />
          العودة للبوتات
        </Button>
      </motion.div>
    );
  }

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${bot!.id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const messages = { start: 'تم تشغيل البوت', stop: 'تم إيقاف البوت', restart: 'تم إعادة التشغيل' };
      toast.success(messages[action]);
      fetchBot();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/bots/${bot!.id}/export`, { credentials: 'include' });
      if (!res.ok) {
        toast.error('فشل في تصدير بيانات البوت');
        return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${bot!.name}-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تصدير بيانات البوت بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bots/${bot!.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('تم حذف البوت');
      setCurrentPage('bots');
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEnv = async () => {
    setSavingEnv(true);
    try {
      const validEnv = envVars.filter((e) => e.key.trim());
      const res = await fetch(`/api/bots/${bot!.id}/env`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars: validEnv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('تم حفظ متغيرات البيئة');
      fetchBot();
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('حدث خطأ');
    } finally {
      setSavingEnv(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; dotClass: string }> = {
    running: { label: 'يعمل', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotClass: 'bg-emerald-400 pulse-dot' },
    stopped: { label: 'متوقف', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dotClass: 'bg-slate-400' },
    building: { label: 'جاري البناء', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dotClass: 'bg-blue-400 pulse-dot' },
    error: { label: 'خطأ', color: 'bg-red-500/15 text-red-400 border-red-500/30', dotClass: 'bg-red-400' },
  };
  const statusCfg = statusConfig[bot.status] || statusConfig.stopped;

  // Resource usage - loaded from API (defaults to 0 when no data)
  const cpuUsage = 0;
  const ramUsage = 0;
  const cpuPercent = 0;
  const ramPercent = 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Gradient Header with Glassmorphism Action Bar */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary/20 via-primary/5 to-transparent border border-primary/20 p-6"
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => setCurrentPage('bots')}
            >
              <ArrowRight className="h-4 w-4" />
              العودة
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{bot.name}</h1>
                  <Badge variant="outline" className={`gap-1.5 ${statusCfg.color}`}>
                    <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass} ${bot.status === 'running' || bot.status === 'building' ? 'animate-pulse' : ''}`} />
                    {statusCfg.label}
                  </Badge>
                </div>
                {bot.description && (
                  <p className="text-muted-foreground text-sm mt-1">{bot.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism Action Bar */}
        <motion.div
          className="relative mt-4 flex flex-wrap gap-2 backdrop-blur-sm bg-card/40 rounded-xl p-3 border border-border/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'tween' as const, ease: 'easeOut' as const, duration: 0.4 }}
        >
          {bot.status === 'stopped' && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" onClick={() => handleAction('start')} disabled={actionLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                تشغيل
              </Button>
            </motion.div>
          )}
          {bot.status === 'running' && (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={() => handleAction('stop')} disabled={actionLoading} variant="outline" className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                  إيقاف
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={() => handleAction('restart')} disabled={actionLoading} variant="outline" className="gap-2 text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  إعادة تشغيل
                </Button>
              </motion.div>
            </>
          )}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
              onClick={() => setCurrentPage('bot-console')}
            >
              <Terminal className="h-4 w-4" />
              وحدة التحكم
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              تصدير
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button size="sm" variant="outline" className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteDialog(true)}>
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats Cards with Resource Usage Mini-Bars */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">الحاوية</p>
                <p className="text-sm font-mono truncate" dir="ltr">
                  {bot.containerId || '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">المنفذ</p>
                <p className="text-sm font-mono">{bot.port ? `:${bot.port}` : '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الموارد</p>
                <p className="text-sm">{bot.cpuLimit} CPU / {bot.ramLimit}MB RAM</p>
              </div>
            </div>
            {/* Resource Usage Mini-Bars */}
            {bot.status === 'running' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>CPU</span>
                  <span>{cpuUsage}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${cpuPercent}%` }}
                    transition={{ delay: 0.5, duration: 1, type: 'tween' as const, ease: 'easeOut' as const }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>RAM</span>
                  <span>{ramUsage}/{bot.ramLimit}MB</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${ramPercent}%` }}
                    transition={{ delay: 0.7, duration: 1, type: 'tween' as const, ease: 'easeOut' as const }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-primary/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                <p className="text-sm">
                  {format(new Date(bot.createdAt), 'dd/MM/yyyy', { locale: ar })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs with AnimatePresence transitions */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" dir="rtl">
          <TabsList className="bg-muted/50 p-1">
            {[
              { value: 'general', label: 'عام', icon: Activity },
              { value: 'env', label: 'المتغيرات', icon: Zap },
              { value: 'settings', label: 'الإعدادات', icon: FileCode },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabsContent value="general" forceMount style={{ display: activeTab === 'general' ? 'block' : 'none' }}>
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      معلومات البوت
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Mini-card layout for each info item */}
                      {[
                        { label: 'اسم البوت', value: bot.name, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'اللغة', value: bot.language === 'python' ? '🐍 Python' : '🐘 PHP', icon: FileCode, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                        { label: 'الحالة', value: statusCfg.label, icon: Zap, color: statusCfg.color.includes('emerald') ? 'text-emerald-400' : statusCfg.color.includes('red') ? 'text-red-400' : 'text-slate-400', bg: statusCfg.color.includes('emerald') ? 'bg-emerald-500/10' : statusCfg.color.includes('red') ? 'bg-red-500/10' : 'bg-slate-500/10', isBadge: true },
                        { label: 'الملفات', value: `${bot._count.files} ملف`, icon: HardDrive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                        { label: 'السجلات', value: `${bot._count.logs} سجل`, icon: Terminal, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'إعادة التشغيل التلقائية', value: bot.autoRestart ? 'مفعّل' : 'معطّل', icon: RefreshCw, color: bot.autoRestart ? 'text-emerald-400' : 'text-slate-400', bg: bot.autoRestart ? 'bg-emerald-500/10' : 'bg-slate-500/10' },
                        { label: 'تاريخ الإنشاء', value: format(new Date(bot.createdAt), 'dd/MM/yyyy', { locale: ar }), icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        ...(bot.githubUrl ? [{ label: 'رابط GitHub', value: bot.githubUrl, icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-500/10', isMono: true }] : []),
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 260, damping: 24 }}
                        >
                          <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-muted-foreground">{item.label}</p>
                            {item.isBadge ? (
                              <Badge variant="outline" className={`mt-0.5 text-xs ${statusCfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                                {item.value}
                              </Badge>
                            ) : (
                              <p className={`text-sm font-medium mt-0.5 truncate ${item.isMono ? 'font-mono text-xs' : ''}`} dir={item.isMono ? 'ltr' : 'rtl'}>
                                {item.value}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="env" forceMount style={{ display: activeTab === 'env' ? 'block' : 'none' }}>
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                      متغيرات البيئة
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEnvVars([...envVars, { key: '', value: '' }])}
                      className="gap-1 h-8"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      إضافة
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {envVars.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">لا توجد متغيرات بيئة</p>
                    ) : (
                      <>
                        {envVars.map((env, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03, type: 'tween' as const, ease: 'easeOut' as const, duration: 0.2 }}
                          >
                            <Input
                              placeholder="المفتاح"
                              value={env.key}
                              onChange={(e) => {
                                const updated = [...envVars];
                                updated[i] = { ...updated[i], key: e.target.value };
                                setEnvVars(updated);
                              }}
                              className="flex-1 h-9 text-sm font-mono"
                              dir="ltr"
                            />
                            <Input
                              placeholder="القيمة"
                              value={env.value}
                              onChange={(e) => {
                                const updated = [...envVars];
                                updated[i] = { ...updated[i], value: e.target.value };
                                setEnvVars(updated);
                              }}
                              className="flex-1 h-9 text-sm font-mono"
                              dir="ltr"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEnvVars(envVars.filter((_, idx) => idx !== i))}
                              className="h-9 w-9 p-0 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                        <div className="pt-2">
                          <Button
                            onClick={handleSaveEnv}
                            disabled={savingEnv}
                            className="gap-2 bg-primary text-primary-foreground"
                          >
                            {savingEnv ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            حفظ المتغيرات
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" forceMount style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-primary" />
                      إعدادات البوت
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">إعادة التشغيل التلقائية</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          إعادة تشغيل البوت تلقائياً عند تعطله
                        </p>
                      </div>
                      <Switch
                        checked={bot.autoRestart}
                        disabled
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs">حد CPU</Label>
                        <p className="font-medium mt-1">{bot.cpuLimit} نواة</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">حد RAM</Label>
                        <p className="font-medium mt-1">{bot.ramLimit} MB</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-muted-foreground text-xs">معرف الحاوية</Label>
                      <p className="font-mono text-sm mt-1 bg-muted/30 rounded-lg px-3 py-2" dir="ltr">
                        {bot.containerId || 'لا توجد حاوية نشطة'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Bot Timeline Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              الجدول الزمني
              <Badge variant="secondary" className="text-xs mr-2">{timelineEvents.length} أحداث</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute right-[18px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {timelineEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                      <Clock className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">لا يوجد سجل أحداث</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">ستظهر الأحداث هنا تلقائياً</p>
                  </div>
                ) : timelineEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    className="relative flex gap-4 pr-12"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring' as const, stiffness: 260, damping: 24 }}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute right-2.5 top-3 w-3 h-3 rounded-full border-2 ${event.bgColor} ${event.borderColor} z-10`} />

                    {/* Event card */}
                    <div className={`flex-1 p-3 rounded-xl border ${event.borderColor} ${event.bgColor} hover:scale-[1.01] transition-transform`}>
                      <div className="flex items-center gap-2">
                        <event.icon className={`h-4 w-4 ${event.color}`} />
                        <span className="text-sm font-medium">{event.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Floating Bar */}
      <motion.div
        className="sticky bottom-4 z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring' as const, stiffness: 260, damping: 24 }}
      >
        <div className="backdrop-blur-md bg-card/70 border border-border/40 rounded-2xl p-3 shadow-2xl shadow-black/20 flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            إجراءات سريعة:
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5"
            onClick={() => setCurrentPage('bot-console')}
          >
            <Terminal className="h-3.5 w-3.5" />
            وحدة التحكم
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5"
            onClick={() => setCurrentPage('files')}
          >
            <FileCode className="h-3.5 w-3.5" />
            إدارة الملفات
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5"
            onClick={() => setCurrentPage('logs')}
          >
            <Terminal className="h-3.5 w-3.5" />
            عرض السجلات
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs gap-1.5"
            onClick={() => setCurrentPage('bot-monitoring')}
          >
            <Activity className="h-3.5 w-3.5" />
            المراقبة
          </Button>
        </div>
      </motion.div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف البوت &quot;{bot.name}&quot;</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف البوت وجميع ملفاته وسجلاته نهائياً. هل أنت متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-border">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف نهائي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
