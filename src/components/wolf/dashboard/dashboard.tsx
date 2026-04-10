'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Bot,
  Play,
  Square,
  AlertTriangle,
  FileText,
  ScrollText,
  Plus,
  RefreshCw,
  FolderOpen,
  Settings,
  Activity,
  Cpu,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronLeft,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import type { Page } from '@/store/app-store';
import { CreateBotDialog } from '@/components/wolf/bots/create-bot-dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ─── Types ─── */

interface Stats {
  totalBots: number;
  runningBots: number;
  stoppedBots: number;
  errorBots: number;
  totalFiles: number;
  totalLogs: number;
}

interface BotItem {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: string;
  containerId: string | null;
  port: number | null;
  cpuLimit: number;
  ramLimit: number;
  createdAt: string;
  updatedAt: string;
  _count: { files: number; logs: number };
}

interface LogItem {
  id: string;
  botId: string;
  level: string;
  message: string;
  createdAt: string;
  bot?: { name: string };
}

/* ─── Constants ─── */

const statCards = [
  {
    key: 'totalBots' as const,
    label: 'إجمالي البوتات',
    icon: Bot,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    barColor: 'bg-sky-400',
    trend: 'up' as const,
  },
  {
    key: 'runningBots' as const,
    label: 'يعمل الآن',
    icon: Play,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-500/5',
    barColor: 'bg-emerald-400',
    trend: 'up' as const,
  },
  {
    key: 'stoppedBots' as const,
    label: 'متوقف',
    icon: Square,
    iconBg: 'bg-zinc-500/15',
    iconColor: 'text-zinc-400',
    gradientFrom: 'from-zinc-500/20',
    gradientTo: 'to-zinc-500/5',
    barColor: 'bg-zinc-400',
    trend: 'down' as const,
  },
  {
    key: 'errorBots' as const,
    label: 'أخطاء',
    icon: AlertTriangle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-500/5',
    barColor: 'bg-red-400',
    trend: 'down' as const,
  },
  {
    key: 'totalFiles' as const,
    label: 'إجمالي الملفات',
    icon: FileText,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-violet-500/5',
    barColor: 'bg-violet-400',
    trend: 'up' as const,
  },
  {
    key: 'totalLogs' as const,
    label: 'إجمالي السجلات',
    icon: ScrollText,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-orange-500/5',
    barColor: 'bg-orange-400',
    trend: 'up' as const,
  },
];

const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
  running: {
    label: 'يعمل',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-400 pulse-dot',
  },
  stopped: {
    label: 'متوقف',
    className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
    dotClass: 'bg-zinc-400',
  },
  building: {
    label: 'جاري البناء',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    dotClass: 'bg-blue-400 pulse-dot',
  },
  error: {
    label: 'خطأ',
    className: 'bg-red-500/15 text-red-400 border-red-500/25',
    dotClass: 'bg-red-400',
  },
};

const levelConfig: Record<string, { color: string; label: string }> = {
  info: { color: 'bg-emerald-400', label: 'معلومات' },
  warn: { color: 'bg-blue-400', label: 'تحذير' },
  error: { color: 'bg-red-400', label: 'خطأ' },
  debug: { color: 'bg-zinc-400', label: 'تصحيح' },
};

const languageLabels: Record<string, string> = {
  python: 'بايثون',
  javascript: 'جافاسكريبت',
  typescript: 'تايبسكريبت',
  nodejs: 'نود.جي.إس',
};

const quickActions: {
  label: string;
  description: string;
  icon: typeof Bot;
  page: Page;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
}[] = [
  {
    label: 'إنشاء بوت جديد',
    description: 'ابدأ استضافة بوتك الأول',
    icon: Bot,
    page: 'bots',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    label: 'إدارة الملفات',
    description: 'رفع وتعديل ملفات البوت',
    icon: FolderOpen,
    page: 'files',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    iconColor: 'text-sky-400',
  },
  {
    label: 'عرض السجلات',
    description: 'مراقبة سجلات البوت',
    icon: ScrollText,
    page: 'logs',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-orange-500/5',
    iconColor: 'text-orange-400',
  },
  {
    label: 'الإعدادات',
    description: 'تخصيص إعدادات حسابك',
    icon: Settings,
    page: 'settings',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-violet-500/5',
    iconColor: 'text-violet-400',
  },
];

/* ─── Sparkline Bar Component ─── */
function MiniSparkline({ bars, color }: { bars: number[]; color: string }) {
  const max = Math.max(...bars, 1);
  return (
    <div className="flex items-end gap-[3px] h-8 mt-2">
      {bars.map((val, i) => (
        <div
          key={i}
          className={`rounded-sm ${color} opacity-60 transition-opacity hover:opacity-100`}
          style={{ height: `${(val / max) * 100}%`, minWidth: '4px', flex: 1 }}
        />
      ))}
    </div>
  );
}

/* ─── Custom Tooltip for Recharts ─── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-sm" dir="rtl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name === 'cpu' ? 'المعالج' : 'الذاكرة'}:
          </span>
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.value}%
          </span>
        </p>
      ))}
    </div>
  );
}

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

/* ─── Main Dashboard ─── */

export function Dashboard() {
  const { setCurrentPage, setSelectedBotId, user } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  /* ─── Generate deterministic random bars from a seed ─── */
  const generateBars = useCallback((seed: number, count: number = 7) => {
    const bars: number[] = [];
    let s = seed;
    for (let i = 0; i < count; i++) {
      s = (s * 9301 + 49297) % 233280;
      bars.push(Math.floor((s / 233280) * 100) + 10);
    }
    return bars;
  }, []);

  const sparklineData = useMemo(() => {
    if (!stats) return {};
    return {
      totalBots: generateBars(stats.totalBots * 31),
      runningBots: generateBars(stats.runningBots * 17),
      stoppedBots: generateBars(stats.stoppedBots * 13),
      errorBots: generateBars(stats.errorBots * 7 + 3),
      totalFiles: generateBars(stats.totalFiles * 11),
      totalLogs: generateBars(stats.totalLogs * 19),
    };
  }, [stats, generateBars]);

  /* ─── Fetch Stats ─── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      toast.error('فشل في تحميل الإحصائيات');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ─── Fetch Bots ─── */
  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bots', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBots(data);
      }
    } catch {
      toast.error('فشل في تحميل البوتات');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─── Fetch Activity Logs (last 3 per bot, up to 5 bots) ─── */
  const fetchActivityLogs = useCallback(async (botList: BotItem[]) => {
    if (botList.length === 0) {
      setActivityLogs([]);
      setLogsLoading(false);
      return;
    }
    setLogsLoading(true);
    try {
      const botsToFetch = botList.slice(0, 5);
      const logPromises = botsToFetch.map(async (bot) => {
        try {
          const res = await fetch(`/api/bots/${bot.id}/logs?limit=3`, {
            credentials: 'include',
          });
          if (res.ok) {
            const logs = await res.json();
            return logs.map((log: any) => ({ ...log, bot: { name: bot.name } }));
          }
        } catch {
          // skip failed fetches
        }
        return [];
      });

      const allLogs = (await Promise.all(logPromises)).flat();
      allLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivityLogs(allLogs.slice(0, 10));
    } catch {
      // silent fail
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBots();
  }, [fetchStats, fetchBots]);

  // Fetch logs after bots load
  useEffect(() => {
    if (bots.length > 0 && !loading) {
      fetchActivityLogs(bots);
    } else if (bots.length === 0 && !loading) {
      setActivityLogs([]);
      setLogsLoading(false);
    }
  }, [bots.length, loading]);

  /* ─── Resource chart data ─── */
  const resourceChartData = useMemo(() => {
    return bots.slice(0, 6).map((bot, idx) => {
      const seed = bot.id.charCodeAt(0) * 100 + idx;
      const cpuUsed = Math.floor(((seed * 7 + 13) % 70) + 10);
      const ramUsed = Math.floor(((seed * 11 + 29) % 60) + 15);
      return {
        name: bot.name.length > 10 ? bot.name.slice(0, 10) + '…' : bot.name,
        cpu: cpuUsed,
        ram: ramUsed,
      };
    });
  }, [bots]);

  const recentBots = bots.slice(0, 8);

  const handleRefresh = () => {
    fetchStats();
    fetchBots();
    toast.success('تم تحديث البيانات');
  };

  const handleBotCreated = () => {
    fetchStats();
    fetchBots();
  };

  const handleBotClick = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-detail');
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  };

  const getTrendValue = (key: keyof Stats, statsVal: Stats) => {
    // Deterministic pseudo-random trend
    const seed = statsVal[key] * 3 + key.length;
    return seed % 5;
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'المستخدم';

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Welcome Header ─── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary/10 via-card to-card border border-border p-6 sm:p-8"
      >
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
              مرحباً بك، {userName}!
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              إليك ملخص نشاطك اليوم
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('logs')}
              className="gap-2"
            >
              <ScrollText className="size-4" />
              عرض السجلات
            </Button>
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              إنشاء بوت
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          : stats &&
            statCards.map((card) => {
              const Icon = card.icon;
              const trendVal = getTrendValue(card.key, stats);
              const bars = sparklineData[card.key] || [];
              const isUp = card.trend === 'up';
              return (
                <Card
                  key={card.key}
                  className={`group bg-gradient-to-bl ${card.gradientFrom} ${card.gradientTo} border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center size-11 rounded-xl ${card.iconBg} transition-transform group-hover:scale-110`}
                        >
                          <Icon className={`size-5 ${card.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats[card.key]}</p>
                          <p className="text-xs text-muted-foreground">{card.label}</p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          isUp
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-red-400 bg-red-500/10'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {trendVal}%
                      </div>
                    </div>
                    <MiniSparkline bars={bars} color={card.barColor} />
                  </CardContent>
                </Card>
              );
            })}
      </motion.div>

      {/* ─── Quick Actions Grid ─── */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.label}
                className={`group bg-gradient-to-bl ${action.gradientFrom} ${action.gradientTo} border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer`}
                onClick={() => {
                  if (action.page === 'bots') {
                    setCreateDialogOpen(true);
                  } else {
                    setCurrentPage(action.page);
                  }
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-background/60 group-hover:bg-background/80 transition-colors">
                    <Icon className={`size-5 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Middle Row: Activity Timeline + Resource Chart ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── Activity Timeline ─── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card border border-border rounded-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                النشاط الأخير
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('logs')}
                className="text-primary hover:text-primary/80"
              >
                عرض الكل
                <ChevronLeft className="size-4 mr-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="size-2.5 rounded-full shrink-0 mt-1.5" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="size-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">لا يوجد نشاط حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-0 relative">
                  {/* Timeline line */}
                  <div className="absolute top-2 right-[4px] bottom-2 w-px bg-border" />
                  <div className="max-h-80 overflow-y-auto space-y-0">
                    {activityLogs.map((log) => {
                      const level = levelConfig[log.level] || levelConfig.info;
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 py-3 pr-0 pl-2 relative group hover:bg-accent/30 rounded-lg px-3 transition-colors"
                        >
                          {/* Dot */}
                          <div
                            className={`size-[10px] rounded-full mt-1.5 shrink-0 relative z-10 ring-4 ring-card ${level.color}`}
                          />
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm leading-relaxed truncate group-hover:text-foreground text-foreground/90">
                              {log.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {log.bot && (
                                <span className="text-xs text-primary/70 font-medium">
                                  {log.bot.name}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(log.createdAt)}
                              </span>
                            </div>
                          </div>
                          {/* Level Badge */}
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[10px] px-1.5 py-0 ${
                              log.level === 'error'
                                ? 'text-red-400 border-red-500/25 bg-red-500/10'
                                : log.level === 'warn'
                                  ? 'text-blue-400 border-blue-500/25 bg-blue-500/10'
                                  : 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                            }`}
                          >
                            {level.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Resource Usage Chart ─── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card border border-border rounded-xl h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Cpu className="size-5 text-primary" />
                استخدام الموارد
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-400" />
                  المعالج
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-sky-400" />
                  الذاكرة
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : bots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MemoryStick className="size-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">لا توجد بوتات لعرض الموارد</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={resourceChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.28 0.008 270)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: 'oklch(0.60 0.01 270)', fontSize: 11 }}
                      axisLine={{ stroke: 'oklch(0.28 0.008 270)' }}
                      tickLine={false}
                      unit="%"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: 'oklch(0.80 0.01 270)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'oklch(0.25 0.008 270 / 50%)' }}
                    />
                    <Bar
                      dataKey="cpu"
                      name="cpu"
                      fill="oklch(0.70 0.18 160)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={16}
                    />
                    <Bar
                      dataKey="ram"
                      name="ram"
                      fill="oklch(0.65 0.15 230)"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Recent Bots (Horizontal Scroll) ─── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            البوتات الأخيرة
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage('bots')}
            className="text-primary hover:text-primary/80"
          >
            عرض الكل
            <ChevronLeft className="size-4 mr-1" />
          </Button>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-72 shrink-0 rounded-xl" />
            ))}
          </div>
        ) : recentBots.length === 0 ? (
          <Card className="bg-card border border-border rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="size-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">لا توجد بوتات بعد</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                ابدأ بإنشاء بوتك الأول
              </p>
              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-4 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" />
                إنشاء بوت جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
            {recentBots.map((bot) => {
              const status = statusConfig[bot.status] || statusConfig.stopped;
              return (
                <Card
                  key={bot.id}
                  className="shrink-0 w-72 bg-card border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300 cursor-pointer snap-start"
                  onClick={() => handleBotClick(bot.id)}
                >
                  <CardContent className="p-4 flex flex-col gap-3">
                    {/* Bot name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2.5 rounded-full shrink-0 ${status.dotClass}`}
                          />
                          <p className="font-semibold truncate">{bot.name}</p>
                        </div>
                        {bot.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate pr-[18px]">
                            {bot.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${status.className}`}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Bot details */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        <span>{languageLabels[bot.language] || bot.language}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        <span>{bot._count.files} ملف</span>
                      </div>
                    </div>

                    {/* Last updated */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 pt-1 border-t border-border/50">
                      <Clock className="size-3" />
                      <span>آخر تحديث: {formatRelativeTime(bot.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ─── Create Bot Dialog ─── */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleBotCreated}
      />
    </motion.div>
  );
}
