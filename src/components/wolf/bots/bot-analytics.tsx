'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Server,
  HardDrive,
  Network,
  Cpu,
  XCircle,
  Wifi,
  TrendingUp,
  BarChart3,
  Download,
  Trophy,
  Filter,
  Bot,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';
import { motion, type Variants } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

/* ─── Animation Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
} as const;

const cardHoverVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
} as const;

/* ─── Mock Data Generators ─── */

const dayLabels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

function generatePerformanceData(days: number) {
  const labels = days <= 7 ? dayLabels : Array.from({ length: days }, (_, i) => `يوم ${i + 1}`);
  return labels.map((day, i) => ({
    day,
    requests: Math.round(800 + Math.random() * 1200 + (i * 50)),
    responseTime: Math.round(80 + Math.random() * 150 - (i * 3)),
    errors: Math.round(Math.random() * 30 + 5),
    cpu: Math.round(20 + Math.random() * 40),
    memory: Math.round(30 + Math.random() * 35),
  }));
}

function generateResourceData() {
  return [
    { name: 'المعالج (CPU)', value: Math.round(20 + Math.random() * 30), color: '#38bdf8' },
    { name: 'الذاكرة (RAM)', value: Math.round(25 + Math.random() * 25), color: '#818cf8' },
    { name: 'الشبكة', value: Math.round(10 + Math.random() * 20), color: '#34d399' },
    { name: 'القرص', value: Math.round(15 + Math.random() * 25), color: '#fb923c' },
  ];
}

function generateResponseTimeBuckets() {
  return [
    { range: '0-100ms', count: Math.round(2000 + Math.random() * 3000), fill: '#34d399' },
    { range: '100-500ms', count: Math.round(800 + Math.random() * 1500), fill: '#38bdf8' },
    { range: '500ms-1s', count: Math.round(100 + Math.random() * 400), fill: '#fb923c' },
    { range: '>1s', count: Math.round(20 + Math.random() * 80), fill: '#ef4444' },
  ];
}

function generateBotHealthData() {
  const names = ['بوت المساعد', 'بوت الإشعارات', 'بوت الدعم', 'بوت التحليلات', 'بوت المبيعات', 'بوت المجتمع'];
  return names.map((name, i) => ({
    id: `bot-${i + 1}`,
    name,
    status: (i < 4 ? 'healthy' : i === 4 ? 'warning' : 'critical') as 'healthy' | 'warning' | 'critical',
    uptime: Math.round(90 + Math.random() * 10),
    reqPerMin: Math.round(10 + Math.random() * 90),
    errorCount: Math.round(Math.random() * 80),
    score: Math.round((90 + Math.random() * 10) * 10) / 10,
  }));
}

function generateTopErrors() {
  return [
    { message: 'ConnectionTimeoutError: failed to connect to database within 5000ms', count: 142, severity: 'critical' as const },
    { message: 'RateLimitExceeded: API rate limit exceeded for endpoint /messages', count: 98, severity: 'warning' as const },
    { message: 'TypeError: Cannot read property "id" of undefined', count: 67, severity: 'critical' as const },
    { message: 'SocketError: ECONNRESET - Connection reset by peer', count: 45, severity: 'critical' as const },
    { message: 'ValidationError: Missing required field "chat_id" in request', count: 38, severity: 'warning' as const },
    { message: 'TimeoutError: Bot API request timed out after 10000ms', count: 29, severity: 'warning' as const },
    { message: 'AuthError: Invalid bot token, authentication failed', count: 12, severity: 'critical' as const },
    { message: 'MemoryError: Heap allocation failed - out of memory', count: 8, severity: 'critical' as const },
  ];
}

function generateHeatmapData() {
  return Array.from({ length: 7 }, (_, dayIdx) =>
    Array.from({ length: 24 }, (_, hourIdx) => {
      const isWorkHour = hourIdx >= 9 && hourIdx <= 18;
      const isWeekend = dayIdx >= 5;
      const base = isWorkHour ? 60 : 15;
      const weekendPenalty = isWeekend ? -20 : 0;
      const noise = Math.random() * 30;
      return Math.max(0, Math.min(100, Math.round(base + weekendPenalty + noise)));
    })
  );
}

function generateSparkData(length: number, base: number, variance: number): number[] {
  return Array.from({ length }, (_, i) =>
    Math.round(Math.max(0, base + (Math.random() - 0.5) * variance + (i * variance * 0.05)))
  );
}

/* ─── Animated Counter Hook ─── */

function useAnimatedCounter(target: number, duration: number = 1200): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); 
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count;
}

/* ─── Sparkline Component (with gradient fill) ─── */

function Sparkline({
  data,
  color = 'oklch(0.60 0.20 250)',
  width = 90,
  height = 32,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-muted-foreground/40 text-[10px]"
      >
        --
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const gradId = `spark-grad-${color.replace(/[^a-z0-9]/gi, '')}`;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height }} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={padding + ((data.length - 1) / (data.length - 1)) * (width - padding * 2)}
        cy={height - padding - ((data[data.length - 1] - min) / range) * (height - padding * 2)}
        r="2.5"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

/* ─── Glassmorphism Tooltip ─── */

function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-white/10 px-4 py-3 shadow-2xl text-xs backdrop-blur-xl"
      dir="rtl"
      style={{
        background: 'oklch(0.15 0.01 260 / 80%)',
        boxShadow: '0 8px 32px oklch(0 0 0 / 40%), inset 0 1px 0 oklch(1 0 0 / 8%)',
      }}
    >
      <p className="font-semibold mb-2 text-foreground text-sm">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="font-mono font-bold tabular-nums">{item.value.toLocaleString('ar-EG')}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Animated Counter Display ─── */

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const animated = useAnimatedCounter(value);
  return (
    <span className="tabular-nums">
      {prefix}{animated.toLocaleString('ar-EG')}{suffix}
    </span>
  );
}

/* ─── Overview Card Component ─── */

function OverviewCard({
  title,
  value,
  unit,
  change,
  changeDirection,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  sparkData,
  sparkColor,
}: {
  title: string;
  value: number;
  unit?: string;
  change: string;
  changeDirection: 'up' | 'down';
  icon: typeof Zap;
  iconBgClass: string;
  iconColorClass: string;
  sparkData: number[];
  sparkColor: string;
}) {
  return (
    <motion.div variants={cardHoverVariants} whileHover={{ y: -2 }} transition={{ duration: 0.25 }}>
      <Card className="glass rounded-xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center size-10 rounded-xl ${iconBgClass}`}>
                <Icon className={`size-5 ${iconColorClass}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className="text-xl font-bold tabular-nums mt-0.5">
                  <AnimatedCounter value={value} />
                  {unit && <span className="text-sm font-normal text-muted-foreground mr-1">{unit}</span>}
                </p>
              </div>
            </div>
            <Sparkline data={sparkData} color={sparkColor} />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              changeDirection === 'up'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}>
              {changeDirection === 'up' ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {change}
            </div>
            <span className="text-[10px] text-muted-foreground/60">مقارنة بالفترة السابقة</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Health Status Config ─── */

const healthConfig = {
  healthy: {
    label: 'سليم',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
  },
  warning: {
    label: 'تحذير',
    bgClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/30',
    dotClass: 'bg-blue-400',
    textClass: 'text-blue-400',
  },
  critical: {
    label: 'حرج',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-400',
    textClass: 'text-red-400',
  },
};

/* ─── Bot Health Card ─── */

function BotHealthCard({
  bot,
  index,
}: {
  bot: { id: string; name: string; status: 'healthy' | 'warning' | 'critical'; uptime: number; reqPerMin: number; errorCount: number };
  index: number;
}) {
  const config = healthConfig[bot.status];
  const { setCurrentPage, setSelectedBotId } = useAppStore();

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className="glass rounded-xl cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
        onClick={() => {
          setSelectedBotId(bot.id);
          setCurrentPage('bot-detail');
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`size-8 rounded-lg flex items-center justify-center ${config.bgClass}`}>
                <Server className={`size-4 ${config.textClass}`} />
              </div>
              <span className="text-sm font-semibold truncate max-w-[140px]">{bot.name}</span>
            </div>
            <Badge
              variant="outline"
              className={`${config.bgClass} ${config.textClass} ${config.borderClass} gap-1.5 text-[10px]`}
            >
              <span className={`size-1.5 rounded-full ${config.dotClass}`} />
              {config.label}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className={`text-sm font-bold tabular-nums ${bot.uptime >= 95 ? 'text-emerald-400' : bot.uptime >= 85 ? 'text-blue-400' : 'text-red-400'}`}>
                {bot.uptime}%
              </p>
              <p className="text-[9px] text-muted-foreground">التشغيل</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-sm font-bold tabular-nums text-primary">{bot.reqPerMin}</p>
              <p className="text-[9px] text-muted-foreground">طلب/دقيقة</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className={`text-sm font-bold tabular-nums ${bot.errorCount > 50 ? 'text-red-400' : bot.errorCount > 20 ? 'text-blue-400' : 'text-emerald-400'}`}>
                {bot.errorCount}
              </p>
              <p className="text-[9px] text-muted-foreground">خطأ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Error Row Component ─── */

function ErrorRow({
  error,
  index,
}: {
  error: { message: string; count: number; severity: 'critical' | 'warning' };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' as const }}
      className="flex items-start gap-3 py-3 border-b border-border/30 last:border-0 group"
    >
      <div className={`mt-1 shrink-0 flex items-center justify-center size-6 rounded-full ${
        error.severity === 'critical' ? 'bg-red-500/15' : 'bg-blue-500/15'
      }`}>
        {error.severity === 'critical' ? (
          <XCircle className="size-3.5 text-red-400" />
        ) : (
          <AlertTriangle className="size-3.5 text-blue-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground/90 font-mono truncate group-hover:text-foreground transition-colors" dir="ltr">
          {error.message}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`shrink-0 text-[10px] font-mono tabular-nums ${
          error.severity === 'critical'
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}
      >
        {error.count}x
      </Badge>
    </motion.div>
  );
}

/* ─── Heatmap Cell ─── */

function HeatmapCell({ value }: { value: number }) {
  const intensity = value / 100;
  const bg =
    intensity === 0
      ? 'bg-muted/20'
      : intensity < 0.2
        ? 'bg-emerald-500/20'
        : intensity < 0.4
          ? 'bg-emerald-500/40'
          : intensity < 0.6
            ? 'bg-blue-500/50'
            : intensity < 0.8
              ? 'bg-blue-500/70'
              : 'bg-red-500/70';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${bg} rounded-sm aspect-square min-h-[14px] min-w-[14px] cursor-default transition-transform hover:scale-125 hover:ring-1 hover:ring-primary/30`}
      title={`${value}% نشاط`}
    />
  );
}

/* ─── Top Performing Bot Rank Card ─── */

function TopBotCard({
  rank,
  name,
  score,
  uptime,
  requests,
}: {
  rank: number;
  name: string;
  score: number;
  uptime: number;
  requests: number;
}) {
  const rankColors = rank === 1
    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
    : rank === 2
      ? 'bg-slate-400/15 text-slate-300 border-slate-400/30'
      : rank === 3
        ? 'bg-amber-600/15 text-amber-500 border-amber-600/30'
        : 'bg-muted/30 text-muted-foreground border-border/30';

  const rankBgColors = rank === 1
    ? 'from-yellow-500/5 via-transparent to-transparent'
    : rank === 2
      ? 'from-slate-400/5 via-transparent to-transparent'
      : rank === 3
        ? 'from-amber-600/5 via-transparent to-transparent'
        : '';

  return (
    <motion.div
      variants={cardHoverVariants}
      whileHover={{ scale: 1.01, x: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`glass rounded-xl hover:shadow-md hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden`}>
        {rankBgColors && <div className={`absolute inset-0 pointer-events-none bg-gradient-to-l ${rankBgColors}`} />}
        <CardContent className="p-3 relative">
          <div className="flex items-center gap-3">
            {/* Rank Badge */}
            <div className={`flex items-center justify-center size-8 rounded-lg border ${rankColors} text-sm font-bold shrink-0`}>
              {rank <= 3 ? (
                <Trophy className={`size-4 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-500'}`} />
              ) : (
                <span className="text-xs">{rank}</span>
              )}
            </div>

            {/* Bot Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate">{name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">
                  التشغيل: <span className="text-emerald-400 font-medium">{uptime}%</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  الطلبات: <span className="text-primary font-medium">{requests.toLocaleString('ar-EG')}</span>
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="text-center shrink-0">
              <p className={`text-lg font-bold tabular-nums ${
                score >= 95 ? 'text-emerald-400' : score >= 85 ? 'text-sky-400' : 'text-yellow-400'
              }`}>
                {score}
              </p>
              <p className="text-[9px] text-muted-foreground">نقطة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main BotAnalytics Component ─── */

export function BotAnalytics() {
  const [dateRange, setDateRange] = useState('7');
  const [selectedBot, setSelectedBot] = useState('all');

  
  const days = parseInt(dateRange, 10);

  const performanceData = useMemo(() => generatePerformanceData(days), [days]);
  const resourceData = useMemo(() => generateResourceData(), []);
  const responseTimeBuckets = useMemo(() => generateResponseTimeBuckets(), []);
  const botHealthData = useMemo(() => generateBotHealthData(), []);
  const topErrors = useMemo(() => generateTopErrors(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  
  const topBots = useMemo(() =>
    [...botHealthData]
      .map(b => ({ ...b, requests: Math.round(b.reqPerMin * 1440) }))
      .sort((a, b) => b.score - a.score),
    [botHealthData]
  );

  const hourLabels = ['12ص', '1ص', '2ص', '3ص', '4ص', '5ص', '6م', '7م', '8م', '9م', '10م', '11م', '12م', '1م', '2م', '3م', '4م', '5م', '6م', '7م', '8م', '9م', '10م', '11م'];

  
  const totalRequests = useMemo(
    () => performanceData.reduce((sum, d) => sum + d.requests, 0),
    [performanceData]
  );
  const avgResponseTime = useMemo(
    () => Math.round(performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length),
    [performanceData]
  );
  const totalErrors = useMemo(
    () => performanceData.reduce((sum, d) => sum + d.errors, 0),
    [performanceData]
  );
  const avgErrorRate = useMemo(
    () => totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00',
    [totalRequests, totalErrors]
  );

  
  const requestSparkData = useMemo(() => generateSparkData(12, 800, 400), []);
  const responseSparkData = useMemo(() => generateSparkData(12, 120, 80), []);
  const errorSparkData = useMemo(() => generateSparkData(12, 15, 20), []);
  const uptimeSparkData = useMemo(() => generateSparkData(12, 97, 4), []);

  
  const filteredBotHealth = useMemo(() => {
    if (selectedBot === 'all') return botHealthData;
    return botHealthData.filter(b => b.id === selectedBot);
  }, [botHealthData, selectedBot]);

  
  const handleExport = useCallback(() => {
    const headers = ['اليوم', 'الطلبات', 'وقت الاستجابة (ms)', 'الأخطاء'];
    const rows = performanceData.map(d => [d.day, d.requests, d.responseTime, d.errors]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${days}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [performanceData, days]);

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
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">تحليلات البوتات</h1>
            <p className="text-sm text-muted-foreground">نظرة شاملة على أداء جميع البوتات خلال آخر {days} أيام</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              <span className="relative rounded-full size-2 bg-emerald-400" />
            </span>
            مباشر
          </Badge>
        </div>
      </motion.div>

      {/* ─── Controls Bar: Date Range + Filter + Export ─── */}
      <motion.div variants={itemVariants}>
        <Card className="glass rounded-xl">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">الفترة:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger size="sm" className="w-[130px] border-primary/20 bg-primary/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">آخر 7 أيام</SelectItem>
                    <SelectItem value="30">آخر 30 يوم</SelectItem>
                    <SelectItem value="90">آخر 90 يوم</SelectItem>
                  </SelectContent>
                </Select>

                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger size="sm" className="w-[160px] border-border/50">
                    <SelectValue placeholder="جميع البوتات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع البوتات</SelectItem>
                    {botHealthData.map(bot => (
                      <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2 border-primary/20 text-primary hover:bg-primary/10 shrink-0"
                >
                  <Download className="size-3.5" />
                  تصدير CSV
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Overview Cards ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="إجمالي الطلبات"
          value={totalRequests}
          change="12.5%"
          changeDirection="up"
          icon={Activity}
          iconBgClass="bg-primary/15"
          iconColorClass="text-primary"
          sparkData={requestSparkData}
          sparkColor="#38bdf8"
        />
        <OverviewCard
          title="متوسط وقت الاستجابة"
          value={avgResponseTime}
          unit="ms"
          change="3.2%"
          changeDirection="down"
          icon={Zap}
          iconBgClass="bg-emerald-500/15"
          iconColorClass="text-emerald-400"
          sparkData={responseSparkData}
          sparkColor="#34d399"
        />
        <OverviewCard
          title="معدل الخطأ"
          value={parseFloat(avgErrorRate)}
          unit="%"
          change="1.8%"
          changeDirection="down"
          icon={AlertTriangle}
          iconBgClass="bg-red-500/15"
          iconColorClass="text-red-400"
          sparkData={errorSparkData}
          sparkColor="#ef4444"
        />
        <OverviewCard
          title="وقت التشغيل"
          value={99.5}
          unit="%"
          change="0.1%"
          changeDirection="up"
          icon={Clock}
          iconBgClass="bg-sky-500/15"
          iconColorClass="text-sky-400"
          sparkData={uptimeSparkData}
          sparkColor="#38bdf8"
        />
      </motion.div>

      {/* ─── Performance Timeline + Resource Distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Performance Timeline Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  خط الأداء — آخر {days} يوم
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-muted/50">
                  يومياً
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip content={<GlassTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      name="الطلبات"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ fill: '#38bdf8', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      name="وقت الاستجابة (ms)"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ fill: '#34d399', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      name="الأخطاء"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resource Distribution Pie Chart */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Cpu className="size-4 text-primary" />
                توزيع الموارد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {resourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number) => [`${value}%`, '']}
                      content={<GlassTooltip />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {resourceData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-mono tabular-nums font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Top Performing Bots + Bot Health Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performing Bots */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-400" />
                  أفضل البوتات أداءً
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  {topBots.length} بوت
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="space-y-2.5 max-h-[400px] overflow-y-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {topBots.map((bot, index) => (
                  <TopBotCard
                    key={bot.id}
                    rank={index + 1}
                    name={bot.name}
                    score={bot.score}
                    uptime={bot.uptime}
                    requests={bot.requests}
                  />
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bot Health Grid */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Server className="size-4 text-primary" />
                  صحة البوتات
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {filteredBotHealth.filter((b) => b.status === 'healthy').length} سليم
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {filteredBotHealth.filter((b) => b.status === 'warning').length} تحذير
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                    {filteredBotHealth.filter((b) => b.status === 'critical').length} حرج
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredBotHealth.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                      <Server className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">لا توجد بيانات تحليلية</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      ستظهر بيانات صحة البوتات هنا عند توفرها
                    </p>
                  </div>
                ) : (
                  filteredBotHealth.map((bot, index) => (
                    <BotHealthCard key={bot.id} bot={bot} index={index} />
                  ))
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Top Errors + Response Time Distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Error Messages */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-primary" />
                  أكثر الأخطاء شيوعاً
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                  {topErrors.reduce((s, e) => s + e.count, 0).toLocaleString('ar-EG')} إجمالي
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-1">
                {topErrors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                      <AlertTriangle className="size-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">لا توجد أخطاء مسجلة</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      هذا جيد! لا توجد أخطاء في بوتاتك
                    </p>
                  </div>
                ) : topErrors.map((error, index) => (
                  <ErrorRow key={index} error={error} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Response Time Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  توزيع وقت الاستجابة
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-muted/50">
                  آخر 24 ساعة
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeBuckets} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [value.toLocaleString('ar-EG'), 'عدد الطلبات']}
                      content={<GlassTooltip />}
                    />
                    <Bar dataKey="count" name="عدد الطلبات" radius={[6, 6, 0, 0]}>
                      {responseTimeBuckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {responseTimeBuckets.map((bucket) => (
                  <div key={bucket.range} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span className="size-2 rounded-full" style={{ backgroundColor: bucket.fill }} />
                      <span className="text-[10px] text-muted-foreground">{bucket.range}</span>
                    </div>
                    <p className="text-xs font-bold tabular-nums">{bucket.count.toLocaleString('ar-EG')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Activity Heatmap ─── */}
      <motion.div variants={itemVariants}>
        <Card className="glass rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wifi className="size-4 text-primary" />
                خريطة النشاط
              </CardTitle>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>أقل</span>
                <div className="flex gap-0.5">
                  <span className="size-3 rounded-sm bg-muted/20" />
                  <span className="size-3 rounded-sm bg-emerald-500/20" />
                  <span className="size-3 rounded-sm bg-emerald-500/40" />
                  <span className="size-3 rounded-sm bg-blue-500/50" />
                  <span className="size-3 rounded-sm bg-blue-500/70" />
                  <span className="size-3 rounded-sm bg-red-500/70" />
                </div>
                <span>أكثر</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {/* Column headers (hours) */}
                <div className="flex items-center mb-2" style={{ paddingRight: '64px' }}>
                  {hourLabels.map((label, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground/50 min-w-[14px]">
                      {i % 3 === 0 ? label : ''}
                    </div>
                  ))}
                </div>
                {/* Heatmap rows */}
                <div className="space-y-1">
                  {heatmapData.map((row, dayIndex) => (
                    <div key={dayIndex} className="flex items-center gap-2">
                      {/* Day label */}
                      <div className="w-14 text-[11px] text-muted-foreground text-right shrink-0">
                        {dayLabels[dayIndex]}
                      </div>
                      {/* Heat cells */}
                      <div className="flex gap-1 flex-1">
                        {row.map((value, hourIndex) => (
                          <div key={hourIndex} className="flex-1 min-w-[14px]">
                            <HeatmapCell value={value} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default BotAnalytics;
