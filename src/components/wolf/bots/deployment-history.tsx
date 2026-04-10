'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  History,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Play,
  Zap,
  GitBranch,
  Terminal,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/* ═══════════════════════════════════════════════════════
   Animation Variants — all ease/type strings use `as const`
   ═══════════════════════════════════════════════════════ */

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
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const timelineItemVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const statsCardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const filterPillVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

const emptyStateVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ─── Types ─── */

type DeploymentStatus = 'success' | 'failed' | 'in_progress' | 'rolled_back';
type EventType = 'deploy' | 'redeploy' | 'rollback' | 'stop';
type TriggerType = 'manual' | 'auto';
type DateRange = '7days' | '30days' | '90days';

interface DeploymentEvent {
  id: string;
  botName: string;
  status: DeploymentStatus;
  eventType: EventType;
  timestamp: Date;
  duration: number;
  trigger: TriggerType;
  version: string;
  logs: string[];
}

/* ─── Mock Data ─── */

const mockBotNames = [
  'بوت المساعد الذكي',
  'بوت إدارة المجموعات',
  'بوت الترجمة',
  'بوت التسوق',
  'بوت الدعم الفني',
  'بوت الإشعارات',
];

const generateMockDeployments = (): DeploymentEvent[] => {
  const statuses: DeploymentStatus[] = ['success', 'success', 'success', 'success', 'failed', 'in_progress', 'rolled_back'];
  const eventTypes: EventType[] = ['deploy', 'redeploy', 'deploy', 'rollback', 'stop', 'deploy', 'redeploy'];
  const triggers: TriggerType[] = ['manual', 'auto', 'manual', 'auto', 'manual'];
  const versions = ['v2.1.3', 'v2.1.4', 'v2.2.0', 'v2.2.1', 'v3.0.0-beta', 'v3.0.0', 'v2.1.2'];

  const successLogs = [
    '[INFO] بدء عملية النشر...',
    '[INFO] جاري سحب الكود من المستودع',
    '[SUCCESS] تم بناء الصورة بنجاح (2.4s)',
    '[INFO] جاري تشغيل الحاوية...',
    '[SUCCESS] الحاوية تعمل بنجاح',
    '[INFO] التحقق من صحة الخدمة...',
    '[SUCCESS] جميع الفحوصات نجحت ✓',
  ];
  const failedLogs = [
    '[INFO] بدء عملية النشر...',
    '[INFO] جاري سحب الكود من المستودع',
    '[ERROR] فشل في تثبيت الحزم',
    '[ERROR] ModuleNotFoundError: No module named "telegram"',
    '[WARN] إعادة المحاولة (1/3)...',
    '[ERROR] فشلت إعادة المحاولة',
    '[ERROR] تم إلغاء النشر',
  ];
  const inProgressLogs = [
    '[INFO] بدء عملية النشر...',
    '[INFO] جاري سحب الكود من المستودع',
    '[INFO] جاري تثبيت الحزم...',
    '[INFO] تثبيت: python-telegram-bot==20.0',
    '[INFO] جاري بناء الصورة Docker...',
  ];

  const deployments: DeploymentEvent[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const hoursAgo = i * 2 + Math.random() * 4;
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const status = statuses[i % statuses.length];
    const logs = status === 'success' ? successLogs
      : status === 'failed' ? failedLogs
      : status === 'in_progress' ? inProgressLogs
      : [
          '[INFO] بدء عملية التراجع...',
          '[WARN] التراجع إلى النسخة السابقة',
          '[INFO] جاري استعادة v2.1.2...',
          '[SUCCESS] تم التراجع بنجاح',
        ];

    deployments.push({
      id: `deploy-${i + 1}`,
      botName: mockBotNames[i % mockBotNames.length],
      status,
      eventType: eventTypes[i % eventTypes.length],
      timestamp,
      duration: status === 'in_progress' ? 0 : Math.floor(10 + Math.random() * 120),
      trigger: triggers[i % triggers.length],
      version: versions[i % versions.length],
      logs,
    });
  }

  return deployments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const allDeployments = generateMockDeployments();

const generateChartData = () => {
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  return days.map((day) => ({
    day,
    success: Math.floor(Math.random() * 6) + 1,
    failed: Math.floor(Math.random() * 2),
  }));
};

const chartData = generateChartData();

/* ─── Status Config ─── */

const statusConfig: Record<DeploymentStatus, {
  label: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
  dotStyle: string;
  glowClass: string;
}> = {
  success: {
    label: 'ناجح',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
    dotStyle: 'background: oklch(0.70 0.20 160)',
    glowClass: 'shadow-[0_0_8px_oklch(0.70_0.20_160/40%)]',
  },
  failed: {
    label: 'فشل',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-400',
    textClass: 'text-red-400',
    dotStyle: 'background: oklch(0.70 0.22 25)',
    glowClass: 'shadow-[0_0_8px_oklch(0.70_0.22_25/40%)]',
  },
  in_progress: {
    label: 'قيد التنفيذ',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/30',
    dotClass: 'bg-sky-400',
    textClass: 'text-sky-400',
    dotStyle: 'background: oklch(0.70 0.15 230)',
    glowClass: 'shadow-[0_0_8px_oklch(0.70_0.15_230/40%)]',
  },
  rolled_back: {
    label: 'تم التراجع',
    bgClass: 'bg-violet-500/15',
    borderClass: 'border-violet-500/30',
    dotClass: 'bg-violet-400',
    textClass: 'text-violet-400',
    dotStyle: 'background: oklch(0.65 0.20 290)',
    glowClass: 'shadow-[0_0_8px_oklch(0.65_0.20_290/40%)]',
  },
};

const eventTypeConfig: Record<EventType, {
  label: string;
  icon: typeof Rocket;
  badgeClass: string;
}> = {
  deploy: {
    label: 'نشر',
    icon: Rocket,
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
  },
  redeploy: {
    label: 'إعادة نشر',
    icon: RotateCcw,
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  rollback: {
    label: 'تراجع',
    icon: RotateCcw,
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  },
  stop: {
    label: 'إيقاف',
    icon: Terminal,
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

const filterStatuses: { value: string; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'success', label: 'ناجح' },
  { value: 'failed', label: 'فشل' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'rolled_back', label: 'تم التراجع' },
];

/* ─── Helpers ─── */

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `منذ ${diffSec} ثانية`;
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة`;
  return `منذ ${diffDay} يوم`;
}

/* ─── Animated Number Counter Hook ─── */

function useAnimatedCounter(target: number, duration: number = 1200): number {
  const [count, setCount] = useState(() => target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

/* ─── Custom Chart Tooltip ─── */

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs" dir="rtl">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </span>
          <span className="font-mono font-medium">{item.value.toLocaleString('ar-EG')}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Animated Stats Card Component ─── */

function StatsCard({
  title,
  targetValue,
  suffix,
  change,
  changeDirection,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  badgeText,
  badgeClass,
  delay,
}: {
  title: string;
  targetValue: number;
  suffix?: string;
  change: string;
  changeDirection: 'up' | 'down';
  icon: typeof Rocket;
  iconBgClass: string;
  iconColorClass: string;
  badgeText?: string;
  badgeClass?: string;
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(targetValue, 1400);

  return (
    <motion.div
      variants={statsCardVariants}
      custom={delay}
      className="deploy-stats-card bg-card border-border rounded-xl"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center size-10 rounded-xl ${iconBgClass}`}>
              <Icon className={`size-5 ${iconColorClass}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5 counter-animated">
                {targetValue % 1 !== 0
                  ? animatedValue.toFixed(1)
                  : animatedValue.toLocaleString('ar-EG')}
                {suffix && <span className="text-sm font-normal text-muted-foreground mr-1">{suffix}</span>}
              </p>
            </div>
          </div>
          {badgeText && (
            <Badge variant="outline" className={`text-[10px] ${badgeClass || ''}`}>
              {badgeText}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
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
          <span className="text-[10px] text-muted-foreground/60">مقارنة بالأسبوع الماضي</span>
        </div>
      </CardContent>
    </motion.div>
  );
}

/* ─── Timeline Entry Component ─── */

function TimelineEntry({
  event,
  index,
  isLast,
}: {
  event: DeploymentEvent;
  index: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[event.status];
  const eventConfig = eventTypeConfig[event.eventType];
  const EventIcon = eventConfig.icon;

  const getLogLineClass = useCallback((log: string) => {
    if (log.includes('[ERROR]')) return 'log-line-error';
    if (log.includes('[WARN]')) return 'log-line-warn';
    if (log.includes('[SUCCESS]')) return 'log-line-success';
    if (log.includes('[INFO]')) return 'log-line-info';
    return 'log-line-debug';
  }, []);

  const getLogIcon = useCallback((log: string) => {
    if (log.includes('[ERROR]')) return '✕';
    if (log.includes('[WARN]')) return '⚠';
    if (log.includes('[SUCCESS]')) return '✓';
    if (log.includes('[INFO]')) return '●';
    return '◦';
  }, []);

  return (
    <motion.div
      variants={timelineItemVariants}
      className="relative flex gap-4 pb-6 last:pb-0 group"
    >
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`size-3.5 rounded-full z-10 shrink-0 ${config.glowClass} ${
            event.status === 'in_progress' ? 'deploy-dot-active' : ''
          }`}
          style={{ ...{ background: config.dotStyle.split('background: ')[1] } }}
        />
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 timeline-line-glow" />
        )}
      </div>

      {/* Content Card */}
      <div className="flex-1 min-w-0">
        <Card className="timeline-entry-hover bg-card/80 border-border/60 rounded-xl overflow-hidden backdrop-blur-sm">
          <CardContent className="p-4">
            {/* Top Row: Time + Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3" />
                {getRelativeTime(event.timestamp)}
              </span>
              <Badge
                variant="outline"
                className={`${config.bgClass} ${config.textClass} ${config.borderClass} gap-1.5 text-[10px]`}
              >
                {event.status === 'in_progress' && (
                  <Loader2 className="size-3 animate-spin" />
                )}
                {event.status !== 'in_progress' && (
                  <span className={`size-1.5 rounded-full ${config.dotClass}`} />
                )}
                {config.label}
              </Badge>
            </div>

            {/* Bot Name + Event Type */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{event.botName}</span>
              <Badge
                variant="outline"
                className={`gap-1 text-[10px] ${eventConfig.badgeClass}`}
              >
                <EventIcon className="size-3" />
                {eventConfig.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-muted/50 font-mono gap-1">
                <GitBranch className="size-3" />
                {event.version}
              </Badge>
            </div>

            {/* Meta Row: Duration + Trigger */}
            <div className="flex items-center gap-4 flex-wrap">
              {event.status === 'in_progress' ? (
                <span className="flex items-center gap-1.5 text-xs text-sky-400">
                  <Loader2 className="size-3 animate-spin" />
                  جاري النشر...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3" />
                  المدة: {event.duration >= 60
                    ? `${Math.floor(event.duration / 60)} د ${event.duration % 60 > 0 ? `${event.duration % 60} ث` : ''}`
                    : `${event.duration} ثانية`}
                </span>
              )}
              <span className={`flex items-center gap-1.5 text-xs ${
                event.trigger === 'auto' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {event.trigger === 'auto' ? (
                  <Play className="size-3" />
                ) : (
                  <Zap className="size-3" />
                )}
                {event.trigger === 'auto' ? 'تلقائي' : 'يدوي'}
              </span>
            </div>

            {/* Expand/Collapse Logs Button */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground w-full justify-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="size-3" />
                  إخفاء السجلات ({event.logs.length} سطر)
                </>
              ) : (
                <>
                  <ChevronDown className="size-3" />
                  عرض السجلات ({event.logs.length} سطر)
                </>
              )}
            </Button>

            {/* Collapsible Logs Section */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' as const }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-lg bg-muted/30 border border-border/40 p-3 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-0.5" dir="ltr">
                    {event.logs.map((log, logIndex) => (
                      <p key={logIndex} className={getLogLineClass(log)}>
                        <span className="inline-block w-4 opacity-60">{getLogIcon(log)}</span>
                        {' '}
                        {log.replace(/\[(INFO|WARN|ERROR|SUCCESS|DEBUG)\]/, '').trim()}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

/* ─── Enhanced Empty State Component ─── */

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      variants={emptyStateVariants}
      className="text-center py-16"
    >
      <div className="empty-wolf-float inline-block mb-6">
        <img
          src="https:
          alt="استضافة الذئب"
          className="w-24 h-24 mx-auto rounded-full opacity-40"
        />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? 'لا توجد نتائج' : 'لا توجد عمليات نشر'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
        {hasFilters
          ? 'لا توجد عمليات نشر تطابق الفلاتر المحددة. جرب تغيير الفلاتر أو مسحها.'
          : 'لم يتم تسجيل أي عمليات نشر بعد. ستظهر هنا جميع أحداث النشر تلقائياً.'}
      </p>
      {hasFilters && (
        <p className="text-xs text-primary/70">
          جرب تعديل فلاتر البحث
        </p>
      )}
    </motion.div>
  );
}

/* ─── Main DeploymentHistory Component ─── */

export function DeploymentHistory() {
  const [selectedBot, setSelectedBot] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [visibleCount, setVisibleCount] = useState(10);

  
  const filteredDeployments = useMemo(() => {
    let filtered = [...allDeployments];

    const now = new Date();
    let cutoffDate: Date;
    switch (dateRange) {
      case '7days':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }
    filtered = filtered.filter((d) => d.timestamp >= cutoffDate);

    if (selectedBot !== 'all') {
      filtered = filtered.filter((d) => d.botName === selectedBot);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    return filtered;
  }, [selectedBot, selectedStatus, dateRange]);

  
  const stats = useMemo(() => {
    const total = filteredDeployments.length;
    const successCount = filteredDeployments.filter((d) => d.status === 'success').length;
    const failedCount = filteredDeployments.filter((d) => d.status === 'failed').length;
    const successRate = total > 0 ? ((successCount / total) * 100) : 0;
    const completedDeployments = filteredDeployments.filter((d) => d.duration > 0);
    const avgDeployTime = completedDeployments.length > 0
      ? completedDeployments.reduce((sum, d) => sum + d.duration, 0) / completedDeployments.length
      : 0;

    return {
      total,
      successRate: Number(successRate.toFixed(1)),
      avgDeployTime: Math.round(avgDeployTime),
      failedCount,
    };
  }, [filteredDeployments]);

  
  const visibleDeployments = filteredDeployments.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDeployments.length;
  const hasActiveFilters = selectedBot !== 'all' || selectedStatus !== 'all';

  const dateRangeLabels: Record<DateRange, string> = {
    '7days': 'آخر 7 أيام',
    '30days': 'آخر 30 يوم',
    '90days': 'آخر 90 يوم',
  };

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
            <History className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">سجل النشر</h1>
            <p className="text-sm text-muted-foreground">
              تتبع جميع أحداث نشر البوتات ({filteredDeployments.length} نشر)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            يتم التتبع مباشرة
          </Badge>
        </div>
      </motion.div>

      {/* ─── Filter Pills (Glassmorphism) ─── */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground shrink-0" />
        {filterStatuses.map((status) => (
          <motion.button
            key={status.value}
            variants={filterPillVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedStatus(status.value)}
            className={`filter-pill-glass rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer ${
              selectedStatus === status.value ? 'active' : ''
            }`}
          >
            {status.value === 'success' && (
              <span className="inline-block size-1.5 rounded-full bg-emerald-400 ml-1.5" />
            )}
            {status.value === 'failed' && (
              <span className="inline-block size-1.5 rounded-full bg-red-400 ml-1.5" />
            )}
            {status.value === 'in_progress' && (
              <span className="inline-block size-1.5 rounded-full bg-sky-400 ml-1.5 animate-pulse" />
            )}
            {status.value === 'rolled_back' && (
              <span className="inline-block size-1.5 rounded-full bg-violet-400 ml-1.5" />
            )}
            {status.label}
            {status.value !== 'all' && (
              <span className="text-muted-foreground mr-1">
                ({status.value === 'all'
                  ? filteredDeployments.length
                  : filteredDeployments.filter((d) => status.value === 'all' || d.status === status.value).length})
              </span>
            )}
          </motion.button>
        ))}

        {/* Bot Selector (compact) */}
        <div className="mr-auto sm:mr-0">
          <Select value={selectedBot} onValueChange={setSelectedBot}>
            <SelectTrigger className="w-auto min-w-[140px] h-8 text-xs bg-muted/30 border-border filter-pill-glass">
              <SelectValue placeholder="جميع البوتات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع البوتات</SelectItem>
              {mockBotNames.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range (compact) */}
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-auto min-w-[130px] h-8 text-xs bg-muted/30 border-border filter-pill-glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">آخر 7 أيام</SelectItem>
            <SelectItem value="30days">آخر 30 يوم</SelectItem>
            <SelectItem value="90days">آخر 90 يوم</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* ─── Stats Cards with Animated Counters ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي عمليات النشر"
          targetValue={stats.total}
          change="14.2%"
          changeDirection="up"
          icon={Rocket}
          iconBgClass="bg-primary/15"
          iconColorClass="text-primary"
          delay={0}
        />
        <StatsCard
          title="معدل النجاح"
          targetValue={stats.successRate}
          suffix="%"
          change="2.1%"
          changeDirection="up"
          icon={CheckCircle2}
          iconBgClass="bg-emerald-500/15"
          iconColorClass="text-emerald-400"
          badgeText={stats.successRate >= 90 ? 'ممتاز' : stats.successRate >= 75 ? 'جيد' : 'يحتاج تحسين'}
          badgeClass={
            stats.successRate >= 90
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : stats.successRate >= 75
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
          }
          delay={1}
        />
        <StatsCard
          title="متوسط وقت النشر"
          targetValue={stats.avgDeployTime}
          suffix="ثانية"
          change="8.5%"
          changeDirection="down"
          icon={Clock}
          iconBgClass="bg-sky-500/15"
          iconColorClass="text-sky-400"
          delay={2}
        />
        <StatsCard
          title="عمليات النشر الفاشلة"
          targetValue={stats.failedCount}
          change="5.3%"
          changeDirection="down"
          icon={XCircle}
          iconBgClass="bg-red-500/15"
          iconColorClass="text-red-400"
          delay={3}
        />
      </motion.div>

      {/* ─── Mini Deploy Chart ─── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="size-4 text-primary" />
                عمليات النشر — {dateRangeLabels[dateRange]}
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ background: 'oklch(0.70 0.20 160)' }} />
                  <span className="text-muted-foreground">ناجح</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm" style={{ background: 'oklch(0.70 0.22 25)' }} />
                  <span className="text-muted-foreground">فاشل</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="success" name="ناجح" stackId="a" radius={[0, 0, 4, 4]} maxBarSize={40}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`success-${index}`} fill="oklch(0.70 0.20 160)" />
                    ))}
                  </Bar>
                  <Bar dataKey="failed" name="فاشل" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`failed-${index}`} fill="oklch(0.70 0.22 25)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Deployment Timeline ─── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                الجدول الزمني للنشر
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-muted/50">
                {filteredDeployments.length} حدث
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto">
              <motion.div
                className="space-y-0 pr-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`${selectedBot}-${selectedStatus}-${dateRange}`}
              >
                {visibleDeployments.length > 0 ? (
                  visibleDeployments.map((event, index) => (
                    <TimelineEntry
                      key={event.id}
                      event={event}
                      index={index}
                      isLast={index === visibleDeployments.length - 1}
                    />
                  ))
                ) : (
                  <EmptyState hasFilters={hasActiveFilters} />
                )}
              </motion.div>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-4 pt-4 border-t border-border/50 text-center">
                <Button
                  variant="outline"
                  className="gap-2 text-sm"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 10, filteredDeployments.length))}
                >
                  <ChevronDown className="size-4" />
                  تحميل المزيد
                  <span className="text-xs text-muted-foreground">
                    ({Math.min(visibleCount + 10, filteredDeployments.length) - visibleCount} من {filteredDeployments.length - visibleCount} متبقي)
                  </span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default DeploymentHistory;
