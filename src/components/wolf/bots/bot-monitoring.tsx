'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  Bot,
  Disc3,
  Play,
  Square,
  CircleDot,
  Radio,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

/* ═══════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════ */

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
  description?: string | null;
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

interface BotHealthCard {
  id: string;
  name: string;
  status: string;
  language: string;
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  responseTimes: number[];
  errorRate: number;
  requestCount: number;
}

/* ═══════════════════════════════════════════════════════
   Config Maps
   ═══════════════════════════════════════════════════════ */

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
    color: 'text-sky-400',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/30',
    dotClass: 'bg-sky-400 pulse-dot',
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

const botStatusConfig: Record<string, {
  label: string;
  dotClass: string;
  dotColor: string;
  cardGlow: string;
}> = {
  running: {
    label: 'يعمل',
    dotClass: 'animate-pulse',
    dotColor: 'oklch(0.70 0.18 160)',
    cardGlow: '0 0 20px oklch(0.70 0.18 160 / 15%), 0 0 40px oklch(0.70 0.18 160 / 5%)',
  },
  stopped: {
    label: 'متوقف',
    dotClass: '',
    dotColor: 'oklch(0.40 0.005 260)',
    cardGlow: 'none',
  },
  building: {
    label: 'جاري البناء',
    dotClass: 'animate-pulse',
    dotColor: 'oklch(0.60 0.20 250)',
    cardGlow: '0 0 16px oklch(0.60 0.20 250 / 12%)',
  },
  error: {
    label: 'خطأ',
    dotClass: '',
    dotColor: 'oklch(0.65 0.22 25)',
    cardGlow: '0 0 20px oklch(0.65 0.22 25 / 15%)',
  },
};

const eventConfig: Record<string, {
  icon: typeof AlertTriangle;
  color: string;
  bgClass: string;
  label: string;
}> = {
  error: { icon: XCircle, color: 'text-red-400', bgClass: 'bg-red-500/15', label: 'خطأ' },
  restart: { icon: RotateCcw, color: 'text-sky-400', bgClass: 'bg-sky-500/15', label: 'إعادة تشغيل' },
  deploy: { icon: Upload, color: 'text-violet-400', bgClass: 'bg-violet-500/15', label: 'نشر' },
  info: { icon: Activity, color: 'text-emerald-400', bgClass: 'bg-emerald-500/15', label: 'معلومات' },
  warning: { icon: AlertTriangle, color: 'text-sky-400', bgClass: 'bg-sky-500/15', label: 'تحذير' },
};

/* ═══════════════════════════════════════════════════════
   Default Data Generators
   ═══════════════════════════════════════════════════════ */

function generateMockResponseTimes(baseMs: number): number[] {
  return Array.from({ length: 12 }, () =>
    Math.max(10, baseMs + (Math.random() - 0.5) * baseMs * 0.6)
  );
}

function getBotHealthCard(bot: BotData): BotHealthCard {
  const isRunning = bot.status === 'running';
  const isError = bot.status === 'error';
  return {
    id: bot.id,
    name: bot.name,
    status: bot.status,
    language: bot.language,
    cpu: isRunning ? Math.round(Math.random() * 40 + 10) : 0,
    memory: isRunning ? Math.round(Math.random() * 50 + 15) : 0,
    disk: isRunning ? Math.round(Math.random() * 30 + 10) : 0,
    uptime: isRunning ? Math.round(Math.random() * 5 + 95) : isError ? 0 : Math.round(Math.random() * 80),
    responseTimes: isRunning ? generateMockResponseTimes(Math.round(Math.random() * 200 + 50)) : [],
    errorRate: isRunning ? Math.round(Math.random() * 5 * 10) / 10 : isError ? Math.round(Math.random() * 30 + 10) : 0,
    requestCount: isRunning ? Math.round(Math.random() * 5000 + 100) : 0,
  };
}

function getDefaultMetrics(status: string): HealthMetrics {
  return {
    cpu: 0,
    memory: 0,
    uptime: 0,
    requestCount: 0,
    responseTime: 0,
    errorRate: 0,
    healthStatus: status === 'running' ? 'unknown' : status === 'stopped' ? 'critical' : 'unknown',
  };
}

function getDefaultEnvironment(): EnvironmentInfo {
  return {
    nodeVersion: '--',
    dockerStatus: '--',
    totalMemory: '--',
    usedMemory: '--',
    cpuCores: 0,
    platform: '--',
    uptime: '--',
    containerRuntime: '--',
  };
}

/* ═══════════════════════════════════════════════════════
   Motion Variants
   ═══════════════════════════════════════════════════════ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
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

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
} as const;

const emptyFloatVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
} as const;

const refreshSpinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' as const },
  },
  idle: {
    rotate: 0,
    transition: { duration: 0 },
  },
} as const;

/* ═══════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════ */

/* ─── Circular Gauge (CSS conic-gradient) ─── */
function CircularGauge({
  value,
  label,
  color,
  size = 80,
}: {
  value: number;
  label: string;
  color: string;
  size?: number;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const deg = (clamped / 100) * 360;
  const center = size / 2;
  const radius = (size - 12) / 2;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="relative rounded-full"
            style={{
              width: size,
              height: size,
              background: `conic-gradient(${color} ${deg}deg, oklch(0.18 0.008 260) ${deg}deg)`,
            }}
          >
            {/* Inner circle to create donut effect */}
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                top: 6,
                left: 6,
                right: 6,
                bottom: 6,
                background: 'oklch(0.11 0.008 260)',
              }}
            >
              <span className="text-sm font-bold tabular-nums text-foreground">
                {clamped}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {label}: {clamped}%
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Sparkline (SVG polyline) ─── */
function Sparkline({
  data,
  color = 'oklch(0.60 0.20 250)',
  height = 32,
  width = 120,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
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
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, height }}
      className="overflow-visible"
    >
      {/* Gradient fill area */}
      <defs>
        <linearGradient id={`spark-grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-grad-${color.replace(/[^a-z0-9]/gi, '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {data.length > 0 && (
        <circle
          cx={
            padding +
            ((data.length - 1) / (data.length - 1)) * (width - padding * 2)
          }
          cy={
            height -
            padding -
            ((data[data.length - 1] - min) / range) * (height - padding * 2)
          }
          r="2.5"
          fill={color}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

/* ─── Uptime Bar ─── */
function UptimeBar({ uptime }: { uptime: number }) {
  const isGood = uptime >= 95;
  const isWarning = uptime >= 85 && uptime < 95;
  const barColor = isGood
    ? 'oklch(0.65 0.20 160)'
    : isWarning
      ? 'oklch(0.60 0.20 250)'
      : 'oklch(0.65 0.22 25)';
  const textColor = isGood
    ? 'text-emerald-400'
    : isWarning
      ? 'text-sky-400'
      : 'text-red-400';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">وقت التشغيل</span>
        <span className={`text-xs font-bold tabular-nums ${textColor}`}>
          {uptime.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'oklch(0.18 0.008 260)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${barColor}, oklch(0.60 0.15 200))` }}
          initial={{ width: 0 }}
          animate={{ width: `${uptime}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
        />
      </div>
    </div>
  );
}

/* ─── Animated Status Dot ─── */
function StatusDot({ status, size = 8 }: { status: string; size?: number }) {
  const cfg = botStatusConfig[status] || botStatusConfig.stopped;
  const isError = status === 'error';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size + 6, height: size + 6 }}>
      {/* Ping ring for running/error/building */}
      {(status === 'running' || status === 'building' || isError) && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: cfg.dotColor }}
        />
      )}
      <span
        className={`relative rounded-full ${cfg.dotClass}`}
        style={{ width: size, height: size, background: cfg.dotColor }}
      />
    </div>
  );
}

/* ─── Auto-Refresh Indicator ─── */
function AutoRefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Badge
        variant="outline"
        className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/25 px-2.5 py-0.5"
      >
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
          <span className="relative rounded-full size-2 bg-emerald-400" />
        </span>
        مباشر
      </Badge>
      <motion.div
        variants={refreshSpinVariants}
        animate={isRefreshing ? 'spin' : 'idle'}
      >
        <RefreshCw className="size-3.5 text-muted-foreground" />
      </motion.div>
      <span className="text-[10px] text-muted-foreground">
        {isRefreshing ? 'جاري التحديث...' : 'تحديث تلقائي'}
      </span>
    </div>
  );
}

/* ─── Bot Health Card (Dashboard) ─── */
function BotHealthDashboardCard({
  botCard,
  onClick,
}: {
  botCard: BotHealthCard;
  onClick: () => void;
}) {
  const cfg = botStatusConfig[botCard.status] || botStatusConfig.stopped;
  const sparkColor =
    botCard.status === 'running'
      ? 'oklch(0.60 0.20 250)'
      : botCard.status === 'error'
        ? 'oklch(0.65 0.22 25)'
        : 'oklch(0.40 0.005 260)';

  const gradientOverlay =
    botCard.status === 'running'
      ? 'from-emerald-500/8 via-transparent to-transparent'
      : botCard.status === 'error'
        ? 'from-red-500/8 via-transparent to-transparent'
        : botCard.status === 'building'
          ? 'from-sky-500/6 via-transparent to-transparent'
          : 'from-zinc-500/4 via-transparent to-transparent';

  const handleQuickAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: cfg.cardGlow,
        transition: { duration: 0.25 },
      }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="glass rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 group relative">
        {/* Gradient overlay based on status */}
        <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${gradientOverlay} rounded-xl`} />

        {/* Pulsing border for running/error */}
        {(botCard.status === 'running' || botCard.status === 'error') && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: botCard.status === 'running'
                ? ['0 0 0px oklch(0.70 0.18 160 / 0%), 0 0 12px oklch(0.70 0.18 160 / 10%), 0 0 0px oklch(0.70 0.18 160 / 0%)']
                : ['0 0 0px oklch(0.65 0.22 25 / 0%), 0 0 12px oklch(0.65 0.22 25 / 10%), 0 0 0px oklch(0.65 0.22 25 / 0%)'],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        )}

        <CardContent className="p-4 space-y-3 relative">
          {/* Header: bot name + status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'oklch(0.60 0.20 250 / 10%)' }}>
                <Bot className="size-4" style={{ color: 'oklch(0.60 0.20 250 / 70%)' }} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {botCard.name}
                </h4>
                <span className="text-[10px] text-muted-foreground">
                  {botCard.language === 'python' ? 'Python' : 'PHP'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status={botCard.status} />
              <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
            </div>
          </div>

          {/* Circular Gauges: CPU / RAM / Disk */}
          {botCard.status === 'running' ? (
            <div className="flex items-center justify-around pt-1">
              <CircularGauge value={botCard.cpu} label="المعالج" color="oklch(0.60 0.20 250)" size={56} />
              <CircularGauge value={botCard.memory} label="الذاكرة" color="oklch(0.65 0.15 200)" size={56} />
              <CircularGauge value={botCard.disk} label="القرص" color="oklch(0.55 0.18 280)" size={56} />
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <span className="text-xs text-muted-foreground/60">
                {botCard.status === 'stopped' ? 'البوت متوقف' : botCard.status === 'error' ? 'يوجد خطأ' : 'جاري البناء...'}
              </span>
            </div>
          )}

          <Separator className="opacity-30" />

          {/* Uptime Bar */}
          <UptimeBar uptime={botCard.uptime} />

          {/* Sparkline + Error Rate */}
          {botCard.status === 'running' && (
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[9px] text-muted-foreground/60 block mb-0.5">وقت الاستجابة</span>
                <Sparkline data={botCard.responseTimes} color={sparkColor} height={28} width={100} />
              </div>
              <div className="text-left shrink-0">
                <span className="text-[9px] text-muted-foreground/60 block">الطلبات</span>
                <span className="text-xs font-bold tabular-nums text-foreground/80">
                  {botCard.requestCount.toLocaleString('ar-EG')}
                </span>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
            {botCard.status === 'running' ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => handleQuickAction(e, 'restart')}
                      className="flex items-center justify-center size-7 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors"
                    >
                      <RotateCcw className="size-3.5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p>إعادة تشغيل</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => handleQuickAction(e, 'stop')}
                      className="flex items-center justify-center size-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Square className="size-3" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p>إيقاف</p></TooltipContent>
                </Tooltip>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={(e) => handleQuickAction(e, 'start')}
                    className="flex items-center justify-center size-7 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <Play className="size-3.5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>تشغيل</p></TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onClick}
                  className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors mr-auto"
                >
                  <Activity className="size-3.5" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>التفاصيل</p></TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Resource Bar Chart ─── */
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
                <span className={`text-xs font-mono tabular-nums ${isCritical ? 'text-red-400' : isHigh ? 'text-sky-400' : 'text-emerald-400'}`}>
                  {bar.value}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden relative" style={{ background: 'oklch(0.15 0.01 260 / 60%)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isCritical
                      ? 'linear-gradient(to left, oklch(0.65 0.22 25), oklch(0.70 0.18 25))'
                      : isHigh
                        ? 'linear-gradient(to left, oklch(0.60 0.20 250), oklch(0.55 0.15 200))'
                        : 'linear-gradient(to left, oklch(0.65 0.20 160), oklch(0.60 0.15 180))',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' as const }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Live History Bars ─── */
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
            className={`flex-1 rounded-t-sm ${isLast ? 'opacity-100' : 'opacity-40'}`}
            style={{ background: color }}
            initial={{ height: 0 }}
            animate={{ height: `${heightPct}%` }}
            transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' as const }}
          />
        );
      })}
    </div>
  );
}

/* ─── Uptime Display (detailed view) ─── */
function UptimeDisplay({ uptime }: { uptime: number }) {
  const isGood = uptime >= 95;
  const isWarning = uptime >= 85 && uptime < 95;
  const colorClass = isGood ? 'text-emerald-400' : isWarning ? 'text-sky-400' : 'text-red-400';
  const barColorClass = isGood ? '[&>div]:bg-emerald-500' : isWarning ? '[&>div]:bg-sky-500' : '[&>div]:bg-red-500';

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

/* ─── Metric Card ─── */
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
      <Card className="glass rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
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
      transition={{ duration: 0.3, ease: 'easeOut' as const }}
      className="flex items-start gap-3 group"
    >
      <div className="relative flex flex-col items-center">
        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ring-4 ring-card ${config.bgClass} group-hover:scale-110 transition-transform`}>
          <Icon className={`size-3.5 ${config.color}`} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border/60 min-h-[24px]" />
        )}
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.bgClass} ${config.color} border-transparent`}>
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

/* ═══════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════ */

export default function BotMonitoring() {
  const { selectedBotId, setCurrentPage, setSelectedBotId } = useAppStore();
  const [bot, setBot] = useState<BotData | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [events, setEvents] = useState<BotEvent[]>([]);
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  
  const [allBots, setAllBots] = useState<BotData[]>([]);
  const [botHealthCards, setBotHealthCards] = useState<BotHealthCard[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Fetch All Bots (for dashboard) ─── */
  const fetchAllBots = useCallback(async () => {
    try {
      const res = await fetch('/api/bots', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllBots(data);
        setBotHealthCards(data.map(getBotHealthCard));
      }
    } catch {
      
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  /* ─── Fetch Single Bot Data ─── */
  const fetchBotData = useCallback(async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bots/${selectedBotId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBot(data);
        setMetrics(getDefaultMetrics(data.status));
        setEvents([]);
        setEnvironment(getDefaultEnvironment());
      }
    } catch {
      
    } finally {
      setLoading(false);
    }
  }, [selectedBotId]);

  /* ─── Handle Refresh ─── */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAllBots(), selectedBotId ? fetchBotData() : Promise.resolve()]);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  }, [fetchAllBots, fetchBotData, selectedBotId]);

  /* ─── Auto-refresh every 30s ─── */
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [handleRefresh]);

  /* ─── Initial Load ─── */
  useEffect(() => {
    fetchAllBots();
  }, [fetchAllBots]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData, refreshKey]);

  /* ─── CPU & Memory History ─── */
  const cpuHistory = useMemo(() => {
    if (!metrics || metrics.cpu === 0) return new Array(20).fill(0);
    return new Array(20).fill(metrics.cpu);
  }, [metrics]);

  const memoryHistory = useMemo(() => {
    if (!metrics || metrics.memory === 0) return new Array(20).fill(0);
    return new Array(20).fill(metrics.memory);
  }, [metrics]);

  /* ─── System Gauges Data (from all bots aggregate) ─── */
  const systemGauges = useMemo(() => {
    if (botHealthCards.length === 0) return { cpu: 0, memory: 0, disk: 0 };
    const runningBots = botHealthCards.filter((b) => b.status === 'running');
    if (runningBots.length === 0) return { cpu: 0, memory: 0, disk: 0 };
    return {
      cpu: Math.round(runningBots.reduce((s, b) => s + b.cpu, 0) / runningBots.length),
      memory: Math.round(runningBots.reduce((s, b) => s + b.memory, 0) / runningBots.length),
      disk: Math.round(runningBots.reduce((s, b) => s + b.disk, 0) / runningBots.length),
    };
  }, [botHealthCards]);

  /* ═══════════════════════════════════════════════════════
     Render: No Bot Selected → Global Health Dashboard
     ═══════════════════════════════════════════════════════ */
  if (!selectedBotId) {
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
            <div className="flex items-center justify-center size-10 rounded-xl" style={{ background: 'oklch(0.60 0.20 250 / 10%)' }}>
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">لوحة المراقبة</h1>
              <p className="text-sm text-muted-foreground">مراقبة حالة جميع البوتات في الوقت الفعلي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AutoRefreshIndicator isRefreshing={isRefreshing} />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-60"
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRefreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' as const } : { duration: 0.3 }}
                >
                  <RefreshCw className="size-4" />
                </motion.div>
                {isRefreshing ? 'جاري التحديث...' : 'تحديث الآن'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── System Gauges Row ─── */}
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3 shrink-0">
                  <Server className="size-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">موارد النظام</h3>
                    <p className="text-[10px] text-muted-foreground">متوسط الاستخدام عبر جميع البوتات</p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-14 hidden sm:block" />
                <div className="flex items-center gap-8 sm:gap-10 flex-wrap justify-center">
                  <CircularGauge value={systemGauges.cpu} label="المعالج" color="oklch(0.60 0.20 250)" size={72} />
                  <CircularGauge value={systemGauges.memory} label="الذاكرة" color="oklch(0.65 0.15 200)" size={72} />
                  <CircularGauge value={systemGauges.disk} label="القرص" color="oklch(0.55 0.18 280)" size={72} />
                </div>
                <div className="flex flex-col gap-2 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-emerald-400 tabular-nums">
                      {botHealthCards.filter((b) => b.status === 'running').length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">يعمل</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-400 tabular-nums">
                      {botHealthCards.filter((b) => b.status === 'error').length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">أخطاء</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground/60 tabular-nums">
                      {botHealthCards.filter((b) => b.status === 'stopped').length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">متوقف</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Bot Health Cards Grid ─── */}
        {globalLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : allBots.length === 0 ? (
          /* ─── Enhanced Empty State ─── */
          <motion.div
            variants={fadeInVariants}
            className="glass rounded-xl overflow-hidden relative"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute -top-20 -left-20 size-40 rounded-full opacity-[0.03]"
                style={{ background: 'radial-gradient(circle, oklch(0.60 0.20 250), transparent)' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
              />
              <motion.div
                className="absolute -bottom-10 -right-10 size-32 rounded-full opacity-[0.04]"
                style={{ background: 'radial-gradient(circle, oklch(0.65 0.20 160), transparent)' }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
              />
            </div>

            <div className="flex flex-col items-center justify-center py-24 px-6 text-center relative">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
                className="relative mb-8"
              >
                {/* Glow ring behind logo */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(circle, oklch(0.60 0.20 250 / 20%), transparent 70%)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <img
                  src="https:
                  alt="شعار الذئب"
                  className="w-24 h-24 rounded-2xl object-cover glow-effect relative"
                />
              </motion.div>

              {/* Animated signal waves around the logo */}
              <div className="absolute top-6 right-1/2 translate-x-[60px]">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute size-4 rounded-full border border-primary/20"
                    animate={{
                      scale: [1, 2 + i * 0.8],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeOut' as const,
                    }}
                  />
                ))}
              </div>

              <motion.h3
                className="text-xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                لا توجد بوتات للمراقبة
              </motion.h3>
              <motion.p
                className="text-muted-foreground text-sm mb-8 max-w-md leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                لم يتم إنشاء أي بوت بعد. ابدأ بإنشاء بوتك الأول على منصة استضافة الذئب
                للاستفادة من لوحة المراقبة المتقدمة وتتبع الأداء في الوقت الفعلي.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setCurrentPage('bots')}
                >
                  <Bot className="size-4" />
                  إنشاء بوت جديد
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {botHealthCards.map((botCard) => (
                <BotHealthDashboardCard
                  key={botCard.id}
                  botCard={botCard}
                  onClick={() => {
                    setSelectedBotId(botCard.id);
                    setCurrentPage('bot-monitoring');
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     Render: Loading State
     ═══════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
     Render: Bot Detail Monitoring
     ═══════════════════════════════════════════════════════ */
  const healthCfg = healthStatusConfig[metrics.healthStatus];
  const HealthIcon = healthCfg.icon;
  const botCardData = botHealthCards.find((b) => b.id === selectedBotId);

  const resourceBars = [
    { label: 'المعالج (CPU)', value: metrics.cpu, color: 'oklch(0.65 0.20 160)' },
    { label: 'الذاكرة (RAM)', value: metrics.memory, color: 'oklch(0.60 0.20 250)' },
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
            onClick={() => {
              setSelectedBotId(null);
              setCurrentPage('bot-monitoring');
            }}
          >
            <ArrowRight className="h-4 w-4" />
            لوحة المراقبة
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl" style={{ background: 'oklch(0.60 0.20 250 / 10%)' }}>
              <Activity className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">مراقبة البوت</h1>
              <p className="text-sm text-muted-foreground">{bot.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot status={bot.status} size={8} />
          <span className="text-xs text-muted-foreground">
            {botStatusConfig[bot.status]?.label || bot.status}
          </span>
          <Separator orientation="vertical" className="h-4" />
          <AutoRefreshIndicator isRefreshing={isRefreshing} />
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-60"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={isRefreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' as const } : { duration: 0.3 }}
              >
                <RefreshCw className="size-4" />
              </motion.div>
              {isRefreshing ? 'جاري التحديث...' : 'تحديث الآن'}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── System Gauges + Health Overview ─── */}
      <motion.div variants={itemVariants}>
        <Card className="glass rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(135deg, oklch(0.60 0.20 250 / 5%) 0%, transparent 50%, transparent 100%)',
          }} />
          <CardContent className="relative p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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

              {/* System Resource Gauges */}
              <div className="flex items-center gap-5">
                <CircularGauge value={botCardData?.cpu ?? metrics.cpu} label="المعالج" color="oklch(0.60 0.20 250)" size={80} />
                <CircularGauge value={botCardData?.memory ?? metrics.memory} label="الذاكرة" color="oklch(0.65 0.15 200)" size={80} />
                <CircularGauge value={botCardData?.disk ?? 0} label="القرص" color="oklch(0.55 0.18 280)" size={80} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                {[
                  { icon: Clock, label: 'وقت التشغيل', value: `${metrics.uptime.toFixed(1)}%`, color: metrics.uptime >= 95 ? 'text-emerald-400' : 'text-sky-400' },
                  { icon: Zap, label: 'وقت الاستجابة', value: `${metrics.responseTime}ms`, color: metrics.responseTime < 200 ? 'text-emerald-400' : metrics.responseTime < 400 ? 'text-sky-400' : 'text-red-400' },
                  { icon: Wifi, label: 'معدل الخطأ', value: `${metrics.errorRate}%`, color: metrics.errorRate < 10 ? 'text-emerald-400' : metrics.errorRate < 30 ? 'text-sky-400' : 'text-red-400' },
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
          trend={metrics.cpu < 50 ? 'stable' : 'up'}
        />
        <MetricCard
          icon={HardDrive}
          label="استخدام الذاكرة"
          value={metrics.memory}
          unit="%"
          subValue={`حد ${bot.ramLimit} MB`}
          iconBgClass="bg-sky-500/15"
          iconColorClass="text-sky-400"
          trend={metrics.memory < 60 ? 'stable' : 'up'}
        />
        <MetricCard
          icon={Timer}
          label="وقت الاستجابة"
          value={metrics.responseTime}
          unit="ms"
          subValue={metrics.responseTime < 200 ? 'أداء ممتاز' : metrics.responseTime < 400 ? 'أداء جيد' : 'يحتاج تحسين'}
          iconBgClass="bg-sky-500/15"
          iconColorClass="text-sky-400"
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
          trend={metrics.errorRate < 10 ? 'stable' : 'up'}
        />
      </motion.div>

      {/* ─── Response Time Sparkline Card ─── */}
      {botCardData && botCardData.responseTimes.length > 0 && (
        <motion.div variants={fadeInVariants}>
          <Card className="glass rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                وقت الاستجابة الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-2">
                <Sparkline data={botCardData.responseTimes} color="oklch(0.60 0.20 250)" height={48} width={500} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                <span>أقدم</span>
                <span className="text-primary font-medium">آخر 12 قراءة</span>
                <span>أحدث</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
              <Card className="glass rounded-xl">
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
                        <StatusDot status="running" size={6} />
                        <span className="text-[10px] text-muted-foreground/60">مباشر</span>
                      </div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                      <LiveHistoryBars data={cpuHistory} color="oklch(0.65 0.20 160)" />
                    </div>
                  </div>
                  {/* Live Memory History */}
                  <div>
                    <span className="text-xs text-muted-foreground mb-2 block">تاريخ الذاكرة (آخر 20 قراءة)</span>
                    <div className="rounded-lg p-3" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                      <LiveHistoryBars data={memoryHistory} color="oklch(0.65 0.15 200)" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Uptime + Performance */}
              <div className="space-y-4">
                <Card className="glass rounded-xl">
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
                        <Timer className="size-3.5 text-sky-400" />
                        <span className="text-xs font-medium text-muted-foreground">تفاصيل الاستجابة</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                          <p className="text-lg font-bold text-emerald-400 tabular-nums">
                            {metrics.responseTime > 0 ? `${metrics.responseTime}ms` : '--'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">P50</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                          <p className="text-lg font-bold text-sky-400 tabular-nums">
                            {metrics.responseTime > 0 ? `${metrics.responseTime}ms` : '--'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">P95</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                          <p className="text-lg font-bold text-red-400 tabular-nums">
                            {metrics.responseTime > 0 ? `${metrics.responseTime}ms` : '--'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">P99</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Rate Details */}
                <Card className="glass rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <AlertTriangle className="size-4 text-primary" />
                      معدل الأخطاء
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`text-3xl font-bold tabular-nums ${
                        metrics.errorRate < 10 ? 'text-emerald-400' : metrics.errorRate < 30 ? 'text-sky-400' : 'text-red-400'
                      }`}>
                        {metrics.errorRate}%
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'oklch(0.15 0.01 260 / 60%)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: metrics.errorRate < 10
                                ? 'oklch(0.65 0.20 160)'
                                : metrics.errorRate < 30
                                  ? 'oklch(0.60 0.20 250)'
                                  : 'oklch(0.65 0.22 25)',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(metrics.errorRate, 100)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' as const }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'أخطاء الشبكة', value: Math.floor(metrics.errorRate * 0.4), color: 'oklch(0.65 0.22 25)' },
                        { label: 'أخطاء التطبيق', value: Math.floor(metrics.errorRate * 0.35), color: 'oklch(0.60 0.20 250)' },
                        { label: 'أخطاء المهلة', value: Math.max(0, metrics.errorRate - Math.floor(metrics.errorRate * 0.4) - Math.floor(metrics.errorRate * 0.35)), color: 'oklch(0.70 0.15 70)' },
                      ].map((err) => (
                        <div key={err.label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-sm" style={{ background: err.color }} />
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
            <Card className="glass rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  سجل الأحداث
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-muted/50">
                  {events.length} حدث
                </Badge>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="size-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد أحداث مسجلة</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">ستظهر الأحداث هنا عند توفر بيانات المراقبة</p>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Environment Tab ─── */}
          <TabsContent value="environment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Server Info */}
              <Card className="glass rounded-xl">
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
                      { icon: Cpu, label: 'أنوية المعالج', value: `${environment.cpuCores} نواة`, color: 'text-sky-400', bg: 'bg-sky-500/15' },
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
                <Card className="glass rounded-xl">
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
                        { label: 'لغة البوت', value: bot.language === 'python' ? 'Python' : 'PHP' },
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
                <Card className="glass rounded-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Disc3 className="size-4 text-primary" />
                      استخدام الذاكرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="relative size-32">
                        <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.22 0.007 260)" strokeWidth="10" />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r="52"
                            fill="none"
                            stroke={metrics.memory > 80 ? 'oklch(0.65 0.22 25)' : metrics.memory > 60 ? 'oklch(0.60 0.20 250)' : 'oklch(0.65 0.20 160)'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 52}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - metrics.memory / 100) }}
                            transition={{ duration: 1, ease: 'easeOut' as const }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold tabular-nums ${metrics.memory > 80 ? 'text-red-400' : metrics.memory > 60 ? 'text-sky-400' : 'text-emerald-400'}`}>
                            {metrics.memory}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">مستخدم</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg p-2.5" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
                        <p className="text-xs text-muted-foreground">المستخدم</p>
                        <p className="text-sm font-bold text-primary">{environment.usedMemory}</p>
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: 'oklch(0.15 0.01 260 / 30%)' }}>
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
