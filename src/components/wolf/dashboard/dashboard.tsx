'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Bot,
  Play,
  Square,
  AlertTriangle,
  FileText,
  ScrollText,
  Plus,
  FolderOpen,
  Activity,
  Cpu,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronLeft,
  ArrowUpRight,
  BookOpen,
  LifeBuoy,
  Inbox,
  Sparkles,
  Zap,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import type { Page } from '@/store/app-store';
import { CreateBotDialog } from '@/components/wolf/bots/create-bot-dialog';
import { toast } from 'sonner';
import { motion, type Variants } from 'framer-motion';

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

/* ─── Constants ─── */

const WOLF_LOGO = 'https://f.top4top.io/p_37210bgwm1.jpg';

const statCards: {
  key: keyof Stats;
  label: string;
  icon: typeof Bot;
  iconBg: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  barColor: string;
  trend: 'up' | 'down';
}[] = [
  {
    key: 'totalBots',
    label: 'إجمالي البوتات',
    icon: Bot,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    barColor: 'bg-sky-400',
    trend: 'up',
  },
  {
    key: 'runningBots',
    label: 'يعمل الآن',
    icon: Play,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-500/5',
    barColor: 'bg-emerald-400',
    trend: 'up',
  },
  {
    key: 'stoppedBots',
    label: 'متوقف',
    icon: Square,
    iconBg: 'bg-zinc-500/15',
    iconColor: 'text-zinc-400',
    gradientFrom: 'from-zinc-500/20',
    gradientTo: 'to-zinc-500/5',
    barColor: 'bg-zinc-400',
    trend: 'down',
  },
  {
    key: 'errorBots',
    label: 'أخطاء',
    icon: AlertTriangle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-500/5',
    barColor: 'bg-red-400',
    trend: 'down',
  },
  {
    key: 'totalFiles',
    label: 'إجمالي الملفات',
    icon: FileText,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-500/5',
    barColor: 'bg-blue-400',
    trend: 'up',
  },
  {
    key: 'totalLogs',
    label: 'إجمالي السجلات',
    icon: ScrollText,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    barColor: 'bg-sky-400',
    trend: 'up',
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
    label: 'عرض التوثيق',
    description: 'دليل الاستخدام الكامل',
    icon: BookOpen,
    page: 'help',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    iconColor: 'text-sky-400',
  },
  {
    label: 'الدعم الفني',
    description: 'تواصل مع فريق الدعم',
    icon: LifeBuoy,
    page: 'help',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-500/5',
    iconColor: 'text-blue-400',
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
];

/* ─── Animated Counter Component ─── */

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{count}</>;
}

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

/* ─── Wolf Logo Empty State ─── */

function WolfEmptyState({
  message,
  subMessage,
  showButton = false,
  onButtonClick,
}: {
  message: string;
  subMessage?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 blur-2xl bg-primary/10 rounded-full scale-[2]" />
        {/* Inner glow ring */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        {/* Logo container */}
        <div className="relative w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10">
          <img
            src={WOLF_LOGO}
            alt="White Wolf"
            className="w-16 h-16 rounded-xl object-cover"
          />
        </div>
      </motion.div>
      <motion.p
        className="text-foreground font-semibold text-lg"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
      >
        {message}
      </motion.p>
      {subMessage && (
        <motion.p
          className="text-muted-foreground text-sm mt-2 max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
        >
          {subMessage}
        </motion.p>
      )}
      {showButton && onButtonClick && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
        >
          <Button
            size="sm"
            onClick={onButtonClick}
            className="mt-5 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            إنشاء بوت جديد
          </Button>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Small Empty State (for non-primary sections) ─── */
function SmallEmptyState({
  icon: Icon,
  message,
  subMessage,
}: {
  icon: typeof Clock;
  message: string;
  subMessage?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <motion.div
        className="relative mb-4"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full scale-150" />
        <div className="relative bg-primary/10 rounded-2xl p-4">
          <Icon className="size-10 text-primary/50" />
        </div>
      </motion.div>
      <p className="text-muted-foreground font-medium text-sm">{message}</p>
      {subMessage && (
        <p className="text-muted-foreground/60 text-xs mt-1">{subMessage}</p>
      )}
    </div>
  );
}

/* ─── Animation Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const statCardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const welcomeVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const botCardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
};

/* ─── Section Divider Component ─── */

function SectionDivider({ icon: Icon, label }: { icon: typeof Activity; label: string }) {
  return (
    <motion.div variants={itemVariants} className="relative flex items-center gap-3 -my-1">
      <div className="flex-1 h-px bg-gradient-to-l from-primary/15 via-primary/8 to-transparent" />
      <div className="flex items-center gap-1.5 px-2">
        <Icon className="size-3.5 text-primary/50" />
        <span className="text-[10px] text-primary/40 font-medium">{label}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-primary/15 via-primary/8 to-transparent" />
    </motion.div>
  );
}

/* ─── Main Dashboard ─── */

export function Dashboard() {
  const { setCurrentPage, setSelectedBotId, user } = useAppStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<BotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    fetchStats();
    fetchBots();
  }, [fetchStats, fetchBots]);

  const recentBots = bots.slice(0, 8);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchBots()]);
    setRefreshing(false);
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
    const seed = statsVal[key] * 3 + key.length;
    return seed % 5;
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'المستخدم';

  const todayDate = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasNoData = !loading && stats !== null && stats.totalBots === 0 && bots.length === 0;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Welcome Header ─── */}
      <motion.div
        variants={welcomeVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-bl from-primary/10 via-card to-card border border-primary/20 p-6 sm:p-8"
      >
        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/[0.02] rounded-full" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Wolf avatar */}
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0 shadow-lg shadow-primary/5">
              <img
                src={WOLF_LOGO}
                alt="استضافة الذئب"
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                مرحباً بك، {userName}!
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                إليك ملخص نشاطك اليوم — نظرة سريعة على بوتاتك وإحصائياتك
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs flex items-center gap-1.5">
                <Clock className="size-3" />
                {todayDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
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

      {/* ─── Full Empty State ─── */}
      {hasNoData ? (
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-2xl overflow-hidden">
            <CardContent className="p-2">
              <WolfEmptyState
                message="مرحباً بك في استضافة الذئب!"
                subMessage="لم تنشئ أي بوت بعد. ابدأ الآن وأنشئ بوت تيليجرام الأول لك واستمتع بأقوى منصة استضافة!"
                showButton
                onButtonClick={() => setCreateDialogOpen(true)}
              />
            </CardContent>
          </Card>

          {/* Quick actions for empty state */}
          <motion.div variants={itemVariants} className="mt-6">
            <SectionDivider icon={Sparkles} label="ابدأ الآن" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className={`group backdrop-blur-sm bg-card/60 bg-gradient-to-bl ${action.gradientFrom} ${action.gradientTo} border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 hover:shadow-primary/10 transition-all duration-300 cursor-pointer`}
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
        </motion.div>
      ) : (
        <>
          {/* ─── Gradient Section Divider ─── */}
          <motion.div variants={itemVariants} className="relative flex items-center gap-3 -my-1">
            <div className="flex-1 h-px bg-gradient-to-l from-primary/20 via-primary/10 to-transparent" />
            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          </motion.div>

          {/* ─── Stats Grid ─── */}
          <motion.div
            variants={containerVariants}
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
                    <motion.div key={card.key} variants={statCardVariants}>
                      <Card
                        className={`group backdrop-blur-sm bg-card/60 bg-gradient-to-bl ${card.gradientFrom} ${card.gradientTo} border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 cursor-default`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center justify-center size-11 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                              >
                                <Icon className={`size-5 ${card.iconColor}`} />
                              </div>
                              <div>
                                <p className="text-2xl font-bold tabular-nums">
                                  <AnimatedCounter target={stats[card.key]} />
                                </p>
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
                    </motion.div>
                  );
                })}
          </motion.div>

          {/* ─── Quick Actions Divider ─── */}
          <SectionDivider icon={Activity} label="إجراءات سريعة" />

          {/* ─── Quick Actions Grid ─── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className={`group backdrop-blur-sm bg-card/60 bg-gradient-to-bl ${action.gradientFrom} ${action.gradientTo} border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 hover:shadow-primary/10 transition-all duration-300 cursor-pointer`}
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

          {/* ─── Status Summary ─── */}
          {!loading && bots.length > 0 && stats && (
            <>
              <SectionDivider icon={Zap} label="ملخص الحالة" />

              <motion.div variants={itemVariants}>
                <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Status distribution */}
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="size-4 text-primary" />
                          <span className="text-sm font-semibold">توزيع حالة البوتات</span>
                        </div>
                        {/* Progress bar */}
                        <div className="flex h-3 rounded-full overflow-hidden bg-secondary/50">
                          {stats.runningBots > 0 && (
                            <motion.div
                              className="bg-emerald-400 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(stats.runningBots / stats.totalBots) * 100}%`,
                              }}
                              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            />
                          )}
                          {stats.stoppedBots > 0 && (
                            <motion.div
                              className="bg-zinc-400 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(stats.stoppedBots / stats.totalBots) * 100}%`,
                              }}
                              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                            />
                          )}
                          {stats.errorBots > 0 && (
                            <motion.div
                              className="bg-red-400 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(stats.errorBots / stats.totalBots) * 100}%`,
                              }}
                              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
                            />
                          )}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-sm bg-emerald-400" />
                            يعمل ({stats.runningBots})
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-sm bg-zinc-400" />
                            متوقف ({stats.stoppedBots})
                          </span>
                          {stats.errorBots > 0 && (
                            <span className="flex items-center gap-1.5">
                              <span className="size-2.5 rounded-sm bg-red-400" />
                              أخطاء ({stats.errorBots})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-3 min-w-[180px]">
                        <div className="bg-background/60 rounded-lg p-3 text-center border border-border/50">
                          <p className="text-xl font-bold text-emerald-400">
                            <AnimatedCounter target={stats.runningBots} />
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">يعمل الآن</p>
                        </div>
                        <div className="bg-background/60 rounded-lg p-3 text-center border border-border/50">
                          <p className="text-xl font-bold text-sky-400">
                            <AnimatedCounter target={stats.totalFiles} />
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">ملف مرفوع</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {/* ─── Bots Divider ─── */}
          <SectionDivider icon={Bot} label="البوتات الأخيرة" />

          {/* ─── Recent Bots ─── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="size-4 text-primary" />
                </div>
                البوتات الأخيرة
              </h2>
              {bots.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage('bots')}
                  className="text-primary hover:text-primary/80"
                >
                  عرض الكل
                  <ChevronLeft className="size-4 mr-1" />
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-72 shrink-0 rounded-xl" />
                ))}
              </div>
            ) : recentBots.length === 0 ? (
              <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-xl">
                <CardContent className="p-2">
                  <WolfEmptyState
                    message="لا توجد بوتات بعد"
                    subMessage="أنشئ بوتك الأول وابدأ رحلتك مع استضافة الذئب"
                    showButton
                    onButtonClick={() => setCreateDialogOpen(true)}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory custom-scrollbar">
                {recentBots.map((bot, idx) => {
                  const status = statusConfig[bot.status] || statusConfig.stopped;
                  return (
                    <motion.div
                      key={bot.id}
                      custom={idx}
                      variants={botCardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card
                        className="shrink-0 w-72 backdrop-blur-sm bg-card/60 border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 cursor-pointer snap-start"
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
                              <Terminal className="size-3.5" />
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
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ─── Additional Info Cards (when bots exist) ─── */}
          {!loading && bots.length > 0 && (
            <>
              <SectionDivider icon={Cpu} label="معلومات إضافية" />

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {/* Total Logs Card */}
                <motion.div variants={statCardVariants}>
                  <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex items-center justify-center size-11 rounded-xl bg-sky-500/15">
                        <ScrollText className="size-5 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold tabular-nums">
                          <AnimatedCounter target={stats?.totalLogs ?? 0} />
                        </p>
                        <p className="text-xs text-muted-foreground">إجمالي سجلات النشاط</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Most Recent Bot */}
                <motion.div variants={statCardVariants}>
                  <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                    onClick={() => handleBotClick(bots[0].id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex items-center justify-center size-11 rounded-xl bg-primary/15">
                        <Sparkles className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{bots[0].name}</p>
                        <p className="text-xs text-muted-foreground">أحدث بوت — {formatRelativeTime(bots[0].createdAt)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Navigate to Console */}
                <motion.div variants={statCardVariants}>
                  <Card className="backdrop-blur-sm bg-card/60 border border-border rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      if (bots.length > 0) {
                        setSelectedBotId(bots[0].id);
                        setCurrentPage('bot-console');
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex items-center justify-center size-11 rounded-xl bg-emerald-500/15">
                        <Terminal className="size-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">وحدة التحكم</p>
                        <p className="text-xs text-muted-foreground">فتح وحدة تحكم البوت</p>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground/50" />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </>
          )}
        </>
      )}

      {/* ─── Create Bot Dialog ─── */}
      <CreateBotDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleBotCreated}
      />
    </motion.div>
  );
}
