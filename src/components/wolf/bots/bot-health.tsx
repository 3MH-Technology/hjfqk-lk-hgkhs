'use client';

import { useMemo } from 'react';
import {
  HeartPulse,
  Bot,
  Clock,
  Zap,
  AlertTriangle,
  XCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  ReferenceLine,
  Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

type BotStatus = 'running' | 'stopped' | 'error';

interface HealthBot {
  id: string;
  name: string;
  status: BotStatus;
  uptime: number;
  responseTime: number[];
  cpu: number;
  memory: number;
  errors: number;
  lastRestart: string;
  healthScore: number;
}

interface ErrorLogEntry {
  type: string;
  count: number;
  affectedBots: string[];
  severity: 'critical' | 'warning' | 'info';
}

interface SlaMonth {
  month: string;
  uptime: number;
}

/* ═══════════════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════════════ */

const mockBots: HealthBot[] = [
  {
    id: 'b1',
    name: 'بوت الدعم الفني',
    status: 'running',
    uptime: 99.8,
    responseTime: [120, 135, 98, 142, 110, 125, 130, 95, 140, 115, 128, 105, 132, 118, 100, 145, 122, 108, 138, 112, 126, 140, 98, 130],
    cpu: 34,
    memory: 52,
    errors: 2,
    lastRestart: '2025-01-14T08:30:00',
    healthScore: 95,
  },
  {
    id: 'b2',
    name: 'بوت الإشعارات',
    status: 'running',
    uptime: 97.5,
    responseTime: [200, 220, 180, 250, 210, 195, 230, 190, 240, 205, 225, 185, 215, 200, 235, 195, 210, 240, 185, 220, 205, 230, 190, 215],
    cpu: 45,
    memory: 68,
    errors: 8,
    lastRestart: '2025-01-13T14:15:00',
    healthScore: 78,
  },
  {
    id: 'b3',
    name: 'بوت المبيعات',
    status: 'running',
    uptime: 99.9,
    responseTime: [85, 92, 78, 95, 88, 82, 90, 76, 93, 87, 84, 91, 79, 88, 86, 94, 80, 92, 85, 89, 83, 96, 81, 87],
    cpu: 22,
    memory: 38,
    errors: 0,
    lastRestart: '2025-01-10T06:00:00',
    healthScore: 99,
  },
  {
    id: 'b4',
    name: 'بوت الإدارة',
    status: 'error',
    uptime: 72.3,
    responseTime: [350, 420, 500, 380, 450, 390, 480, 410, 520, 360, 440, 470, 390, 510, 380, 430, 460, 400, 490, 370, 450, 420, 510, 380],
    cpu: 78,
    memory: 85,
    errors: 23,
    lastRestart: '2025-01-15T02:45:00',
    healthScore: 32,
  },
  {
    id: 'b5',
    name: 'بوت التحليلات',
    status: 'stopped',
    uptime: 0,
    responseTime: [],
    cpu: 0,
    memory: 0,
    errors: 0,
    lastRestart: '2025-01-12T18:00:00',
    healthScore: 0,
  },
  {
    id: 'b6',
    name: 'بوت المساعد الذكي',
    status: 'running',
    uptime: 98.1,
    responseTime: [150, 165, 142, 170, 155, 148, 168, 140, 172, 158, 145, 162, 150, 175, 140, 160, 152, 168, 145, 170, 155, 148, 165, 150],
    cpu: 52,
    memory: 61,
    errors: 5,
    lastRestart: '2025-01-11T20:30:00',
    healthScore: 85,
  },
];

const mockErrors: ErrorLogEntry[] = [
  {
    type: 'ConnectionTimeout',
    count: 34,
    affectedBots: ['بوت الإدارة', 'بوت الإشعارات'],
    severity: 'critical',
  },
  {
    type: 'MemoryLimitExceeded',
    count: 18,
    affectedBots: ['بوت الإدارة'],
    severity: 'critical',
  },
  {
    type: 'RateLimitWarning',
    count: 42,
    affectedBots: ['بوت الإشعارات', 'بوت المساعد الذكي', 'بوت الدعم الفني'],
    severity: 'warning',
  },
  {
    type: 'DatabaseConnectionLost',
    count: 7,
    affectedBots: ['بوت الإدارة'],
    severity: 'warning',
  },
  {
    type: 'ConfigUpdateDetected',
    count: 12,
    affectedBots: ['بوت المبيعات', 'بوت الدعم الفني'],
    severity: 'info',
  },
];

const mockSLA: SlaMonth[] = [
  { month: 'محرم', uptime: 99.8 },
  { month: 'ذو الحجة', uptime: 99.95 },
  { month: 'ذو القعدة', uptime: 98.7 },
  { month: 'شوال', uptime: 99.5 },
  { month: 'رمضان', uptime: 100 },
  { month: 'شعبان', uptime: 99.2 },
];

const mockResponseTimeChart = (() => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = i;
    const ampm = h < 12 ? 'ص' : 'م';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}${ampm}`;
  });

  return hours.map((hour, i) => ({
    hour,
    'بوت الدعم': Math.round(110 + Math.sin(i * 0.5) * 30 + Math.random() * 20),
    'بوت المبيعات': Math.round(80 + Math.sin(i * 0.3) * 15 + Math.random() * 10),
    'بوت المساعد': Math.round(150 + Math.sin(i * 0.4) * 25 + Math.random() * 15),
  }));
})();

/* ═══════════════════════════════════════════════════════
   Motion Variants
   ═══════════════════════════════════════════════════════ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 },
  },
} as const;

/* ═══════════════════════════════════════════════════════
   Helper Functions
   ═══════════════════════════════════════════════════════ */

function getStatusBadge(status: BotStatus) {
  const config = {
    running: { label: 'يعمل', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotColor: 'bg-emerald-400' },
    stopped: { label: 'متوقف', color: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30', dotColor: 'bg-zinc-400' },
    error: { label: 'خطأ', color: 'bg-red-500/15 text-red-400 border-red-500/30', dotColor: 'bg-red-400' },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`gap-1.5 text-[10px] px-2 py-0.5 ${c.color} border-transparent`}>
      <span className={`size-1.5 rounded-full ${status === 'running' ? 'animate-pulse' : ''} ${c.dotColor}`} />
      {c.label}
    </Badge>
  );
}

function getHealthColor(score: number) {
  if (score > 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', ring: 'oklch(0.65 0.20 160)' };
  if (score > 50) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', ring: 'oklch(0.75 0.15 70)' };
  return { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', ring: 'oklch(0.65 0.22 25)' };
}

function getSeverityConfig(severity: 'critical' | 'warning' | 'info') {
  const config = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, label: 'حرج' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, label: 'تحذير' },
    info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Info, label: 'معلومات' },
  };
  return config[severity];
}

/* ═══════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════ */

/* ─── Circular Progress Ring (SVG) ─── */
function CircularProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const colors = getHealthColor(value);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.18 0.008 260)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className={`absolute text-[10px] font-bold tabular-nums ${colors.text}`}>
        {value}%
      </span>
    </div>
  );
}

/* ─── Mini Sparkline SVG ─── */
function MiniSparkline({
  data,
  color = 'oklch(0.60 0.20 250)',
  height = 28,
  width = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const padding = 2;

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
        <linearGradient id={`spark-${data.length}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${data.length})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Resource Bar ─── */
function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const isHigh = value > 70;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={`text-[10px] font-bold tabular-nums ${isHigh ? 'text-red-400' : 'text-foreground/70'}`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.15 0.01 260)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />
      </div>
    </div>
  );
}

/* ─── Recharts RTL Tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg border border-border/50 p-3 text-right min-w-[160px]" dir="rtl">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-[11px] font-bold tabular-nums text-foreground">{entry.value} مللي ث</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SLA Tooltip ─── */
function SlaTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isAbove = val >= 99.9;
  return (
    <div className="glass rounded-lg border border-border/50 p-3 text-right" dir="rtl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${isAbove ? 'text-emerald-400' : 'text-red-400'}`}>
        {val.toFixed(2)}%
      </p>
      <p className={`text-[10px] mt-0.5 ${isAbove ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
        {isAbove ? 'أعلى من هدف SLA' : 'أقل من هدف SLA'}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

export function BotHealth() {
  const { setCurrentPage, setSelectedBotId } = useAppStore();

  /* ─── Computed Data ─── */
  const stats = useMemo(() => {
    const active = mockBots.filter(b => b.status === 'running').length;
    const stopped = mockBots.filter(b => b.status !== 'running').length;
    const total = mockBots.length;
    const runningBots = mockBots.filter(b => b.status === 'running');
    const avgResponse = runningBots.length > 0
      ? Math.round(runningBots.reduce((sum, b) => {
          const lastTimes = b.responseTime.slice(-6);
          return sum + (lastTimes.length > 0 ? lastTimes.reduce((s, v) => s + v, 0) / lastTimes.length : 0);
        }, 0) / runningBots.length)
      : 0;
    const totalRequests = runningBots.reduce((sum, b) => sum + Math.round(Math.random() * 5000 + 500), 0);

    return {
      active,
      activePercent: Math.round((active / total) * 100),
      stopped,
      stoppedPercent: Math.round((stopped / total) * 100),
      avgResponse,
      totalRequests,
    };
  }, []);

  /* ─── Section 1: Overview Cards ─── */
  const overviewCards = [
    {
      icon: Bot,
      label: 'البوتات النشطة',
      value: stats.active,
      unit: '',
      sub: `${stats.activePercent}% من الإجمالي`,
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      trend: 'up' as const,
    },
    {
      icon: XCircle,
      label: 'البوتات المتوقفة',
      value: stats.stopped,
      unit: '',
      sub: `${stats.stoppedPercent}% من الإجمالي`,
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      trend: 'down' as const,
    },
    {
      icon: Zap,
      label: 'متوسط وقت الاستجابة',
      value: stats.avgResponse,
      unit: ' مللي ث',
      sub: 'آخر 24 ساعة',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
      trend: 'stable' as const,
    },
    {
      icon: TrendingUp,
      label: 'إجمالي الطلبات اليوم',
      value: stats.totalRequests.toLocaleString('ar-EG'),
      unit: '',
      sub: `${mockBots.filter(b => b.status === 'running').length} بوتات نشطة`,
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-400',
      trend: 'up' as const,
    },
  ];

  /* ─── Format Date ─── */
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--';
    }
  };

  /* ─── Navigate to bot detail ─── */
  const handleViewBot = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-detail');
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ═══ Page Header ═══ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
            <HeartPulse className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">مراقب صحة البوتات</h2>
            <p className="text-sm text-muted-foreground">فحص شامل لصحة وأداء جميع البوتات</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-primary/30 text-primary bg-primary/5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          مراقبة مباشرة
        </Badge>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
         Section 1: Overview Cards
         ═══════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="glass rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center size-10 rounded-xl ${card.iconBg}`}>
                      <Icon className={`size-5 ${card.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className="text-xl font-bold tabular-nums mt-0.5">
                        {card.value}{card.unit && <span className="text-sm font-normal text-muted-foreground mr-1">{card.unit}</span>}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${
                    card.trend === 'up'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : card.trend === 'down'
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-zinc-400 bg-zinc-500/10'
                  }`}>
                    {card.trend === 'up' && <ArrowUpRight className="size-3" />}
                    {card.trend === 'down' && <ArrowDownRight className="size-3" />}
                  </div>
                </div>
                {card.sub && (
                  <p className="text-[11px] text-muted-foreground/60 mt-2">{card.sub}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════
         Section 2: Health Grid
         ═══════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="size-4 text-primary" />
          <h3 className="text-lg font-semibold">حالة البوتات</h3>
          <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
            {mockBots.length} بوتات
          </Badge>
        </div>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {mockBots.map((bot) => {
            const healthColors = getHealthColor(bot.healthScore);
            const sparkColor = bot.status === 'error'
              ? 'oklch(0.65 0.22 25)'
              : bot.status === 'running'
                ? 'oklch(0.60 0.20 250)'
                : 'oklch(0.40 0.005 260)';

            return (
              <motion.div key={bot.id} variants={cardVariants}>
                <Card className="glass rounded-xl overflow-hidden hover:border-primary/20 transition-all duration-300 group">
                  <CardContent className="p-4 space-y-4">
                    {/* Bot Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                          <Bot className="size-4 text-primary/70" />
                        </div>
                        <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                          {bot.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border-transparent ${healthColors.bg} ${healthColors.text}`}
                        >
                          {bot.healthScore > 0 && `${bot.healthScore}`}
                          {bot.healthScore === 0 && '--'}
                        </Badge>
                        {getStatusBadge(bot.status)}
                      </div>
                    </div>

                    <Separator className="opacity-30" />

                    {/* Uptime Ring + Sparkline Row */}
                    {bot.status !== 'stopped' ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CircularProgressRing value={bot.uptime} size={52} strokeWidth={4} />
                          <div>
                            <p className="text-[10px] text-muted-foreground">وقت التشغيل</p>
                            <p className={`text-sm font-bold tabular-nums ${getHealthColor(bot.uptime).text}`}>
                              {bot.uptime.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] text-muted-foreground/60 mb-0.5">وقت الاستجابة</p>
                          <MiniSparkline
                            data={bot.responseTime}
                            color={sparkColor}
                            height={32}
                            width={90}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-3">
                        <span className="text-xs text-muted-foreground/50">البوت متوقف — لا توجد بيانات</span>
                      </div>
                    )}

                    {/* CPU & Memory Bars */}
                    {bot.status !== 'stopped' && (
                      <div className="space-y-2">
                        <ResourceBar label="المعالج" value={bot.cpu} color={bot.cpu > 70 ? 'oklch(0.65 0.22 25)' : 'oklch(0.60 0.20 250)'} />
                        <ResourceBar label="الذاكرة" value={bot.memory} color={bot.memory > 70 ? 'oklch(0.65 0.22 25)' : 'oklch(0.65 0.15 200)'} />
                      </div>
                    )}

                    {/* Error Count + Last Restart */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <XCircle className={`size-3 ${bot.errors > 10 ? 'text-red-400' : bot.errors > 0 ? 'text-amber-400' : 'text-muted-foreground/40'}`} />
                        <span className="text-muted-foreground">
                          {bot.errors} خطأ <span className="text-muted-foreground/50">(24 ساعة)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground/50">
                        <Clock className="size-3" />
                        <span>{formatDate(bot.lastRestart)}</span>
                      </div>
                    </div>

                    {/* Health Score Bar */}
                    {bot.status !== 'stopped' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">مؤشر الصحة</span>
                          <span className={`text-[10px] font-bold ${healthColors.text}`}>{bot.healthScore}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.15 0.01 260)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: healthColors.ring }}
                            initial={{ width: 0 }}
                            animate={{ width: `${bot.healthScore}%` }}
                            transition={{ duration: 1, ease: 'easeOut' as const }}
                          />
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 text-xs"
                        onClick={() => handleViewBot(bot.id)}
                      >
                        <Eye className="size-3.5" />
                        عرض التفاصيل
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
         Section 3: Response Time Chart
         ═══════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="glass rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <CardTitle className="text-base">وقت الاستجابة — آخر 24 ساعة</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-400" />
                  <span className="text-muted-foreground">بوت الدعم</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">بوت المبيعات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-violet-400" />
                  <span className="text-muted-foreground">بوت المساعد</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[280px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockResponseTimeChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'oklch(0.25 0.005 260)' }}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v} مللي ث`}
                  />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="بوت الدعم"
                    stroke="oklch(0.60 0.18 240)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="بوت المبيعات"
                    stroke="oklch(0.65 0.20 160)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="بوت المساعد"
                    stroke="oklch(0.60 0.20 290)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
         Section 4: Error Log Summary + Section 5: SLA (side by side on desktop)
         ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Section 4: Error Log Summary */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl overflow-hidden h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <CardTitle className="text-base">أكثر الأخطاء شيوعاً</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {mockErrors.map((error, i) => {
                  const sev = getSeverityConfig(error.severity);
                  const SevIcon = sev.icon;
                  return (
                    <motion.div
                      key={error.type}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08, ease: 'easeOut' as const }}
                      className={`flex items-start gap-3 rounded-lg p-3 border ${sev.bg} ${sev.border} hover:bg-accent/30 transition-colors`}
                    >
                      <div className={`mt-0.5 ${sev.color}`}>
                        <SevIcon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs font-mono font-semibold text-foreground truncate" dir="ltr">
                            {error.type}
                          </code>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-transparent ${sev.bg} ${sev.color}`}>
                              {sev.label}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] tabular-nums font-bold">
                              {error.count}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 truncate">
                          {error.affectedBots.join(' • ')}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 5: Uptime SLA Tracker */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl overflow-hidden h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-emerald-400" />
                  <CardTitle className="text-base">مؤشر وقت التشغيل (SLA)</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  الهدف: 99.9%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[240px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSLA} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: 'oklch(0.25 0.005 260)' }}
                    />
                    <YAxis
                      domain={[98, 100.5]}
                      tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <RechartsTooltip content={<SlaTooltip />} />
                    <ReferenceLine
                      y={99.9}
                      stroke="oklch(0.65 0.22 25)"
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={undefined}
                    />
                    <Bar dataKey="uptime" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {mockSLA.map((entry, index) => (
                        <Cell
                          key={`sla-${index}`}
                          fill={entry.uptime >= 99.9 ? 'oklch(0.65 0.20 160)' : 'oklch(0.65 0.22 25)'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* SLA Legend */}
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-emerald-400" style={{ opacity: 0.8 }} />
                  أعلى من SLA
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-red-400" style={{ opacity: 0.8 }} />
                  أقل من SLA
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-4 border-t-2 border-dashed border-red-400" />
                  هدف 99.9%
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
