'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Server,
  Wifi,
  Zap,
  RefreshCw,
  ArrowRight,
  XCircle,
  Upload,
  RotateCcw,
  Shield,
  Thermometer,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

/* ─── Types ─── */

type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

interface BotData {
  id: string;
  name: string;
  status: string;
  language: string;
  cpuLimit: number;
  ramLimit: number;
  createdAt: string;
  containerId: string | null;
}

interface HealthMetrics {
  cpu: number;
  memory: number;
  uptime: number;
  requestCount: number;
  responseTime: number;
  errorRate: number;
  healthStatus: HealthStatus;
}

interface BotEvent {
  id: string;
  type: 'error' | 'restart' | 'deploy' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

interface EnvironmentInfo {
  nodeVersion: string;
  dockerStatus: string;
  totalMemory: string;
  usedMemory: string;
  cpuCores: number;
  platform: string;
  uptime: string;
  containerRuntime: string;
}

/* ─── Health Status Config ─── */

const healthStatusConfig: Record<HealthStatus, {
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  icon: typeof CheckCircle2;
}> = {
  healthy: {
    label: 'سليم',
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    dotClass: 'bg-emerald-400 pulse-dot',
    icon: CheckCircle2,
  },
  warning: {
    label: 'تحذير',
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    dotClass: 'bg-amber-400 pulse-dot',
    icon: AlertTriangle,
  },
  critical: {
    label: 'حرج',
    color: 'text-red-400',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-400',
    icon: XCircle,
  },
  unknown: {
    label: 'غير معروف',
    color: 'text-zinc-400',
    bgClass: 'bg-zinc-500/15',
    borderClass: 'border-zinc-500/30',
    dotClass: 'bg-zinc-400',
    icon: Minus,
  },
};

/* ─── Event Type Config ─── */

const eventConfig: Record<string, {
  icon: typeof AlertTriangle;
  color: string;
  bgClass: string;
  label: string;
}> = {
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bgClass: 'bg-red-500/15',
    label: 'خطأ',
  },
  restart: {
    icon: RotateCcw,
    color: 'text-sky-400',
    bgClass: 'bg-sky-500/15',
    label: 'إعادة تشغيل',
  },
  deploy: {
    icon: Upload,
    color: 'text-violet-400',
    bgClass: 'bg-violet-500/15',
    label: 'نشر',
  },
  info: {
    icon: Activity,
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/15',
    label: 'معلومات',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/15',
    label: 'تحذير',
  },
};

/* ─── Deterministic Pseudo-Random Generator ─── */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number, index: number): number {
  let s = seed + index * 7919;
  s = ((s >> 16) ^ s) * 0x45d9f3b;
  s = ((s >> 16) ^ s) * 0x45d9f3b;
  s = (s >> 16) ^ s;
  return (Math.abs(s) % 10000) / 10000; // 0.0 to 1.0
}

/* ─── Generate Simulated Metrics ─── */

function generateMetrics(botId: string, botStatus: string): HealthMetrics {
  const hash = hashString(botId);
  const baseCpu = Math.floor(seededRandom(hash, 1) * 60) + 8;
  const baseMemory = Math.floor(seededRandom(hash, 2) * 55) + 15;
  const uptime = Math.floor(seededRandom(hash, 3) * 30) + 70;
  const requestCount = Math.floor(seededRandom(hash, 4) * 50000) + 1200;
  const responseTime = Math.floor(seededRandom(hash, 5) * 450) + 50;
  const errorRate = Math.floor(seededRandom(hash, 6) * 8) * 10;

  let healthStatus: HealthStatus = 'healthy';
  if (botStatus === 'stopped' || botStatus === 'error') {
    healthStatus = 'critical';
  } else if (baseCpu > 75 || baseMemory > 80 || errorRate > 50) {
    healthStatus = 'critical';
  } else if (baseCpu > 50 || baseMemory > 60 || errorRate > 20) {
    healthStatus = 'warning';
  }

  return {
    cpu: botStatus === 'running' ? baseCpu : 0,
    memory: botStatus === 'running' ? baseMemory : 0,
    uptime: botStatus === 'running' ? uptime : 0,
    requestCount,
    responseTime: botStatus === 'running' ? responseTime : 0,
    errorRate: botStatus === 'running' ? errorRate : 100,
    healthStatus,
  };
}

/* ─── Generate Simulated Events ─── */

function generateEvents(botId: string, botName: string): BotEvent[] {
  const hash = hashString(botId);
  const eventTemplates = [
    { type: 'info' as const, message: `تم تشغيل البوت "${botName}" بنجاح` },
    { type: 'deploy' as const, message: 'تم نشر إصدار جديد من الكود' },
    { type: 'info' as const, message: 'التحقق من صحة الاتصال — ناجح' },
    { type: 'warning' as const, message: 'استخدام الذاكرة يقترب من الحد الأقصى' },
    { type: 'info' as const, message: 'تم معالجة 1,250 طلباً بنجاح' },
    { type: 'restart' as const, message: 'إعادة تشغيل تلقائية بسبب تحديث' },
    { type: 'error' as const, message: 'انتهت مهلة الاتصال بقاعدة البيانات' },
    { type: 'info' as const, message: 'تم تحديث متغيرات البيئة' },
    { type: 'warning' as const, message: 'ارتفاع مؤقت في وقت الاستجابة' },
    { type: 'deploy' as const, message: 'تم استعادة النسخة الاحتياطية السابقة' },
    { type: 'error' as const, message: 'فشل في إرسال إشعار تيليجرام' },
    { type: 'info' as const, message: 'بدء جمع البيانات والإحصائيات' },
  ];

  const now = Date.now();
  const count = 8 + (hash % 4);
  const selectedIndices: number[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(seededRandom(hash, 100 + i) * eventTemplates.length);
    selectedIndices.push(idx);
  }

  return selectedIndices.map((idx, i) => {
    const minutesAgo = i === 0 ? Math.floor(seededRandom(hash, 200) * 10) + 2 : Math.floor(seededRandom(hash, 200 + i) * 360) + 5;
    return {
      id: `event-${botId}-${i}`,
      type: eventTemplates[idx].type,
      message: eventTemplates[idx].message,
      timestamp: new Date(now - minutesAgo * 60 * 1000),
    };
  });
}

/* ─── Generate Simulated Environment Info ─── */

function generateEnvironment(botId: string): EnvironmentInfo {
  const hash = hashString(botId);
  const nodeVersions = ['20.11.0', '20.10.0', '18.19.0', '22.1.0'];
  const nodeIdx = hash % nodeVersions.length;
  const totalMemMB = 4096 + (hash % 4096);
  const usedMemMB = Math.floor(totalMemMB * (seededRandom(hash, 300) * 0.4 + 0.3));
  const cores = [2, 4, 6, 8][hash % 4];
  const platforms = ['linux/x86_64', 'linux/arm64'];
  const platIdx = hash % platforms.length;
  const uptimeHours = Math.floor(seededRandom(hash, 400) * 720) + 24;
  const days = Math.floor(uptimeHours / 24);
  const hours = uptimeHours % 24;

  return {
    nodeVersion: nodeVersions[nodeIdx],
    dockerStatus: seededRandom(hash, 301) > 0.1 ? 'نشط' : 'متوقف',
    totalMemory: `${(totalMemMB / 1024).toFixed(1)} GB`,
    usedMemory: `${(usedMemMB / 1024).toFixed(1)} GB`,
    cpuCores: cores,
    platform: platforms[platIdx],
    uptime: `${days} يوم ${hours} ساعة`,
    containerRuntime: 'Docker 24.0.7',
  };
}

/* ─── CSS Bar Chart Component ─── */

function ResourceBarChart({ bars, maxValue, label }: { bars: { label: string; value: number; color: string }[]; maxValue: number; label: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>الحد: {maxValue}%</span>
      </div>
      <div className="space-y-2.5">
        {bars.map((bar, i) => {
          const pct = Math.min((bar.value / maxValue) * 100, 100);
          const isHigh = bar.value > maxValue * 0.75;
          const isCritical = bar.value > maxValue * 0.9;
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground/80">{bar.label}</span>
                <span className={`text-xs font-mono tabular-nums ${isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {bar.value}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full ${isCritical ? 'bg-gradient-to-l from-red-500 to-red-400' : isHigh ? 'bg-gradient-to-l from-amber-500 to-amber-400' : 'bg-gradient-to-l from-emerald-500 to-emerald-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                />
                {/* Threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-amber-400/50"
                  style={{ right: `${75}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Real-time History Bars Component ─── */

function LiveHistoryBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((val, i) => {
        const heightPct = (val / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <motion.div
            key={i}
            className={`flex-1 rounded-t-sm ${color} ${isLast ? 'opacity-100' : 'opacity-40'}`}
            initial={{ height: 0 }}
            animate={{ height: `${heightPct}%` }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

/* ─── Uptime Display Component ─── */

function UptimeDisplay({ uptime }: { uptime: number }) {
  const isGood = uptime >= 95;
  const isWarning = uptime >= 85 && uptime < 95;
  const colorClass = isGood ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-red-400';
  const barColorClass = isGood ? '[&>div]:bg-emerald-500' : isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">وقت التشغيل</span>
        <span className={`text-lg font-bold tabular-nums ${colorClass}`}>{uptime.toFixed(1)}%</span>
      </div>
      <Progress value={uptime} className={`h-2.5 ${barColorClass}`} />
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>0%</span>
        <span className={isGood ? 'text-emerald-500/50' : ''}>95% هدف</span>
        <span>100%</span>
      </div>
    </div>
  );
}

/* ─── Metric Card Component ─── */

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  subValue,
  iconBgClass,
  iconColorClass,
  trend,
}: {
  icon: typeof Cpu;
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  iconBgClass: string;
  iconColorClass: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="bg-card border-border rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center size-10 rounded-xl ${iconBgClass}`}>
                <Icon className={`size-5 ${iconColorClass}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold tabular-nums mt-0.5">
                  {value}{unit && <span className="text-sm font-normal text-muted-foreground mr-1">{unit}</span>}
                </p>
              </div>
            </div>
            {trend && (
              <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
                trend === 'up'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : trend === 'down'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-zinc-400 bg-zinc-500/10'
              }`}>
                {trend === 'up' && <ArrowUpRight className="size-3" />}
                {trend === 'down' && <ArrowDownRight className="size-3" />}
                {trend === 'stable' && <Minus className="size-3" />}
              </div>
            )}
          </div>
          {subValue && (
            <p className="text-[11px] text-muted-foreground/60 mt-2">{subValue}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Event Timeline Item ─── */

function EventTimelineItem({ event, isLast }: { event: BotEvent; isLast: boolean }) {
  const config = eventConfig[event.type] || eventConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 group"
    >
      {/* Timeline dot + line */}
      <div className="relative flex flex-col items-center">
        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-card ${config.bgClass} group-hover:scale-110 transition-transform`}>
          <Icon className={`size-3.5 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border/60 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${config.bgClass} ${config.color} border-transparent`}
          >
            {config.label}
          </Badge>
          <span className="text-[11px] text-muted-foreground/50" dir="ltr">
            {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ar })}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{event.message}</p>
      </div>
    </motion.div>
  );
}

/* ─── Main BotMonitoring Component ─── */

export default function BotMonitoring() {
  const { selectedBotId, setCurrentPage } = useAppStore();
  const [bot, setBot] = useState<BotData | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [events, setEvents] = useState<BotEvent[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchBotData = useCallback(async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBot(data);
        setMetrics(generateMetrics(data.id, data.status));
        setEvents(generateEvents(data.id, data.name));
        setEnvironment(generateEnvironment(data.id));
      }
    } catch {
      // silent fail for monitoring
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData, refreshKey]);

  // Simulated live update interval
  useEffect(() => {
    if (!bot || bot.status !== 'running') return;
    const interval = setInterval(() => {
      setMetrics((prev) => {
        if (!prev) return prev;
        const cpuDelta = (Math.random() - 0.5) * 6;
        const memDelta = (Math.random() - 0.5) * 4;
        const newCpu = Math.max(2, Math.min(98, prev.cpu + cpuDelta));
        const newMem = Math.max(5, Math.min(97, prev.memory + memDelta));
        const rtDelta = (Math.random() - 0.5) * 30;
        const newRt = Math.max(20, Math.min(900, prev.responseTime + rtDelta));

        let newHealth: HealthStatus = 'healthy';
        if (newCpu > 75 || newMem > 80) newHealth = 'critical';
        else if (newCpu > 50 || newMem > 60) newHealth = 'warning';

        return {
          ...prev,
          cpu: Math.round(newCpu),
          memory: Math.round(newMem),
          responseTime: Math.round(newRt),
          healthStatus: newHealth,
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [bot]);

  // Generate CPU history bars
  const cpuHistory = useMemo(() => {
    if (!metrics) return [];
    const hash = bot ? hashString(bot.id) : 42;
    return Array.from({ length: 20 }, (_, i) =>
      Math.max(5, Math.floor(metrics.cpu + (seededRandom(hash, 500 + i) - 0.5) * 30))
    );
  }, [metrics, bot]);

  const memoryHistory = useMemo(() => {
    if (!metrics) return [];
    const hash = bot ? hashString(bot.id) : 42;
    return Array.from({ length: 20 }, (_, i) =>
      Math.max(5, Math.floor(metrics.memory + (seededRandom(hash, 600 + i) - 0.5) * 25))
    );
  }, [metrics, bot]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  /* ─── No Bot Selected State ─── */
  if (!selectedBotId) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative mb-6">
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center glow-effect">
            <Activity className="size-10 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">لم يتم اختيار بوت</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          اختر بوتاً من قائمة البوتات لعرض لوحة المراقبة والصحة الخاصة به
        </p>
        <Button
          variant="outline"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => setCurrentPage('bots')}
        >
          <ArrowRight className="size-4" />
          العودة لقائمة البوتات
        </Button>
      </motion.div>
    );
  }

  /* ─── Loading State ─── */
  if (loading || !bot || !metrics || !environment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const healthCfg = healthStatusConfig[metrics.healthStatus];
  const HealthIcon = healthCfg.icon;

  const resourceBars = [
    { label: 'المعالج (CPU)', value: metrics.cpu, color: 'bg-emerald-400' },
    { label: 'الذاكرة (RAM)', value: metrics.memory, color: 'bg-sky-400' },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Page Header ─── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => setCurrentPage('bot-detail')}
          >
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">مراقبة البوت</h1>
              <p className="text-sm text-muted-foreground">{bot.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="size-2 rounded-full bg-emerald-400 pulse-dot" />
            <span className="text-xs font-medium text-emerald-400">مباشر</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <RefreshCw className="size-4" />
            تحديث
          </Button>
        </div>
      </motion.div>

      {/* ─── System Health Overview ─── */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden rounded-xl border border-border">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Health Status */}
              <div className="flex items-center gap-4">
                <div className={`size-14 rounded-2xl flex items-center justify-center ${healthCfg.bgClass} ring-2 ${healthCfg.borderClass}`}>
                  <HealthIcon className={`size-7 ${healthCfg.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold">حالة النظام</h2>
                    <Badge variant="outline" className={`${healthCfg.bgClass} ${healthCfg.color} ${healthCfg.borderClass} gap-1.5`}>
                      <span className={`size-1.5 rounded-full ${healthCfg.dotClass}`} />
                      {healthCfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {metrics.healthStatus === 'healthy' && 'جميع الأنظمة تعمل بشكل طبيعي'}
                    {metrics.healthStatus === 'warning' && 'بعض المؤشرات تتطلب الانتباه'}
                    {metrics.healthStatus === 'critical' && 'يوجد مشاكل تتطلب تدخل فوري'}
                    {metrics.healthStatus === 'unknown' && 'لا يمكن تحديد حالة النظام حالياً'}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                {[
                  { icon: Clock, label: 'وقت التشغيل', value: `${metrics.uptime.toFixed(1)}%`, color: metrics.uptime >= 95 ? 'text-emerald-400' : 'text-amber-400' },
                  { icon: Zap, label: 'وقت الاستجابة', value: `${metrics.responseTime}ms`, color: metrics.responseTime < 200 ? 'text-emerald-400' : metrics.responseTime < 400 ? 'text-amber-400' : 'text-red-400' },
                  { icon: Wifi, label: 'معدل الخطأ', value: `${metrics.errorRate}%`, color: metrics.errorRate < 10 ? 'text-emerald-400' : metrics.errorRate < 30 ? 'text-amber-400' : 'text-red-400' },
                  { icon: Shield, label: 'الطلبات', value: metrics.requestCount.toLocaleString('ar-EG'), color: 'text-primary' },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <StatIcon className={`size-4 mx-auto mb-1 ${stat.color}`} />
                      <p className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Metric Cards Grid ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Cpu}
          label="استخدام المعالج"
          value={metrics.cpu}
          unit="%"
          subValue={`حد ${bot.cpuLimit} نواة`}
          iconBgClass="bg-emerald-500/15"
          iconColorClass="text-emerald-400"
          trend={metrics.cpu < 50 ? 'stable' : metrics.cpu < 75 ? 'up' : 'up'}
        />
        <MetricCard
          icon={HardDrive}
          label="استخدام الذاكرة"
          value={metrics.memory}
          unit="%"
          subValue={`حد ${bot.ramLimit} MB`}
          iconBgClass="bg-sky-500/15"
          iconColorClass="text-sky-400"
          trend={metrics.memory < 60 ? 'stable' : metrics.memory < 80 ? 'up' : 'up'}
        />
        <MetricCard
          icon={Timer}
          label="وقت الاستجابة"
          value={metrics.responseTime}
          unit="ms"
          subValue={metrics.responseTime < 200 ? 'أداء ممتاز' : metrics.responseTime < 400 ? 'أداء جيد' : 'يحتاج تحسين'}
          iconBgClass="bg-amber-500/15"
          iconColorClass="text-amber-400"
          trend={metrics.responseTime < 200 ? 'stable' : metrics.responseTime < 400 ? 'up' : 'up'}
        />
        <MetricCard
          icon={AlertTriangle}
          label="معدل الخطأ"
          value={metrics.errorRate}
          unit="%"
          subValue={metrics.errorRate < 5 ? 'ضمن الحدود المقبولة' : metrics.errorRate < 20 ? 'يتطلب مراقبة' : 'حرج'}
          iconBgClass="bg-red-500/15"
          iconColorClass="text-red-400"
          trend={metrics.errorRate < 10 ? 'stable' : metrics.errorRate < 30 ? 'up' : 'up'}
        />
      </motion.div>

      {/* ─── Tabs: Overview / Events / Environment ─── */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-1.5">
              <Activity className="size-3.5" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5">
              <Clock className="size-3.5" />
              سجل الأحداث
            </TabsTrigger>
            <TabsTrigger value="environment" className="gap-1.5">
              <Server className="size-3.5" />
              بيئة الخادم
            </TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Resource Usage */}
              <Card className="bg-card border-border rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Cpu className="size-4 text-primary" />
                    استخدام الموارد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ResourceBarChart bars={resourceBars} maxValue={100} label="الاستخدام الحالي" />

                  <Separator />

                  {/* Live CPU History */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">تاريخ المعالج (آخر 20 قراءة)</span>
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 pulse-dot" />
                        <span className="text-[10px] text-muted-foreground/60">مباشر</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <LiveHistoryBars data={cpuHistory} color="bg-emerald-400" />
                    </div>
                  </div>

                  {/* Live Memory History */}
                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">تاريخ الذاكرة (آخر 20 قراءة)</span>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <LiveHistoryBars data={memoryHistory} color="bg-sky-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Uptime + Performance */}
              <div className="space-y-4">
                {/* Uptime Card */}
                <Card className="bg-card border-border rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Clock className="size-4 text-primary" />
                      وقت التشغيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UptimeDisplay uptime={metrics.uptime} />

                    <Separator className="my-4" />

                    {/* Response Time Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="size-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-muted-foreground">تفاصيل الاستجابة</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-emerald-400 tabular-nums">
                            {Math.max(20, metrics.responseTime - Math.floor(Math.random() * 100 + 50))}ms
                          </p>
                          <p className="text-[10px] text-muted-foreground">P50</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-amber-400 tabular-nums">
                            {metrics.responseTime}ms
                          </p>
                          <p className="text-[10px] text-muted-foreground">P95</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-lg font-bold text-red-400 tabular-nums">
                            {metrics.responseTime + Math.floor(Math.random() * 200 + 100)}ms
                          </p>
                          <p className="text-[10px] text-muted-foreground">P99</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Rate Details */}
                <Card className="bg-card border-border rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <AlertTriangle className="size-4 text-primary" />
                      معدل الأخطاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-3xl font-bold tabular-nums ${
                        metrics.errorRate < 10 ? 'text-emerald-400' : metrics.errorRate < 30 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {metrics.errorRate}%
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full transition-colors ${
                              metrics.errorRate < 10 ? 'bg-emerald-500' : metrics.errorRate < 30 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(metrics.errorRate, 100)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error breakdown */}
                    <div className="space-y-2">
                      {[
                        { label: 'أخطاء الشبكة', value: Math.floor(metrics.errorRate * 0.4), color: 'bg-red-400' },
                        { label: 'أخطاء التطبيق', value: Math.floor(metrics.errorRate * 0.35), color: 'bg-amber-400' },
                        { label: 'أخطاء المهلة', value: Math.max(0, metrics.errorRate - Math.floor(metrics.errorRate * 0.4) - Math.floor(metrics.errorRate * 0.35)), color: 'bg-orange-400' },
                      ].map((err) => (
                        <div key={err.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-sm ${err.color}`} />
                            <span className="text-muted-foreground">{err.label}</span>
                          </div>
                          <span className="font-mono tabular-nums">{err.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Events Tab ─── */}
          <TabsContent value="events">
            <Card className="bg-card border-border rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  سجل الأحداث
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-muted/50">
                    {events.length} حدث
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {events.map((event, i) => (
                      <EventTimelineItem
                        key={event.id}
                        event={event}
                        isLast={i === events.length - 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Environment Tab ─── */}
          <TabsContent value="environment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Server Info */}
              <Card className="bg-card border-border rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Server className="size-4 text-primary" />
                    معلومات الخادم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: Thermometer, label: 'إصدار Node.js', value: environment.nodeVersion, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
                      { icon: Server, label: 'منصة Docker', value: environment.dockerStatus, color: environment.dockerStatus === 'نشط' ? 'text-emerald-400' : 'text-red-400', bg: environment.dockerStatus === 'نشط' ? 'bg-emerald-500/15' : 'bg-red-500/15' },
                      { icon: Cpu, label: 'أنوية المعالج', value: `${environment.cpuCores} نواة`, color: 'text-amber-400', bg: 'bg-amber-500/15' },
                      { icon: HardDrive, label: 'الذاكرة الكلية', value: environment.totalMemory, color: 'text-sky-400', bg: 'bg-sky-500/15' },
                      { icon: HardDrive, label: 'الذاكرة المستخدمة', value: environment.usedMemory, color: 'text-violet-400', bg: 'bg-violet-500/15' },
                      { icon: Clock, label: 'وقت تشغيل الخادم', value: environment.uptime, color: 'text-primary', bg: 'bg-primary/15' },
                    ].map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                              <ItemIcon className={`size-4 ${item.color}`} />
                            </div>
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                          </div>
                          <span className="text-sm font-medium" dir="ltr">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Runtime & Platform */}
              <div className="space-y-4">
                <Card className="bg-card border-border rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Shield className="size-4 text-primary" />
                      بيئة التشغيل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'وقت تشغيل الحاويات', value: environment.containerRuntime },
                        { label: 'المنصة', value: environment.platform },
                        { label: 'معرف الحاوية', value: bot.containerId || 'غير متوفر', mono: true },
                        { label: 'لغة البوت', value: bot.language === 'python' ? '🐍 Python' : '🐘 PHP' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className={`text-sm font-medium ${item.mono ? 'font-mono text-xs text-foreground/70' : ''}`} dir="ltr">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Memory Usage Visual */}
                <Card className="bg-card border-border rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <HardDrive className="size-4 text-primary" />
                      استخدام الذاكرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative size-32">
                        {/* Background circle */}
                        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.22 0.007 270)" strokeWidth="10" />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke={metrics.memory > 80 ? 'oklch(0.65 0.22 25)' : metrics.memory > 60 ? 'oklch(0.78 0.15 75)' : 'oklch(0.65 0.20 160)'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - metrics.memory / 100) }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold tabular-nums ${metrics.memory > 80 ? 'text-red-400' : metrics.memory > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {metrics.memory}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">مستخدم</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-muted/30 rounded-lg p-2.5">
                        <p className="text-xs text-muted-foreground">المستخدم</p>
                        <p className="text-sm font-bold text-primary">{environment.usedMemory}</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2.5">
                        <p className="text-xs text-muted-foreground">المتاح</p>
                        <p className="text-sm font-bold text-emerald-400">{environment.totalMemory}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
