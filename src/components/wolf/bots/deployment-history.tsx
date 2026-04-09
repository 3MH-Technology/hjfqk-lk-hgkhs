'use client';

import { useState, useMemo } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
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

const timelineItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
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
  duration: number; // seconds
  trigger: TriggerType;
  version: string;
  logs: string[];
}

/* ─── Mock Data ─── */

const botNames = [
  'بوت الدعم الفني',
  'بوت الإشعارات',
  'بوت المبيعات',
  'بوت الإدارة',
  'بوت التحليلات',
  'بوت المحادثة',
];

const eventTypes: EventType[] = ['deploy', 'redeploy', 'rollback', 'stop'];
const statusOptions: DeploymentStatus[] = ['success', 'success', 'success', 'success', 'success', 'success', 'failed', 'in_progress', 'rolled_back'];
const triggers: TriggerType[] = ['manual', 'auto'];
const versions = ['v2.3.1', 'v2.3.2', 'v2.4.0', 'v2.4.1', 'abc1234', 'def5678', 'v3.0.0-beta', 'v2.2.9'];

function generateMockLogs(status: DeploymentStatus): string[] {
  const baseLogs = [
    '[INFO] بدء عملية النشر...',
    '[INFO] سحب الكود من المستودع...',
    '[INFO] تثبيت التبعيات...',
    '[INFO] بناء التطبيق...',
    '[INFO] إنشاء صورة Docker...',
    '[INFO] بدء الحاوية...',
  ];
  const successLogs = [
    '[INFO] التحقق من صحة التطبيق...',
    '[INFO] اختبار الاتصال بقاعدة البيانات...',
    '[INFO] اختبار الاتصال بـ Redis...',
    '[SUCCESS] النشر تم بنجاح! ✓',
  ];
  const failedLogs = [
    '[ERROR] فشل في إنشاء الحاوية...',
    '[ERROR] خطأ: ETIMEDOUT - انتهاء مهلة الاتصال',
    '[ERROR] تم إلغاء عملية النشر ✗',
  ];
  const rollbackLogs = [
    '[WARN] اكتشاف مشكلة بعد النشر...',
    '[INFO] البدء في عملية التراجع...',
    '[INFO] التراجع إلى الإصدار السابق...',
    '[SUCCESS] تم التراجع بنجاح ✓',
  ];

  switch (status) {
    case 'success':
      return [...baseLogs, ...successLogs];
    case 'failed':
      return [...baseLogs, ...failedLogs];
    case 'rolled_back':
      return [...baseLogs, ...successLogs, ...rollbackLogs];
    case 'in_progress':
      return baseLogs;
    default:
      return baseLogs;
  }
}

function generateDeploymentEvents(): DeploymentEvent[] {
  const events: DeploymentEvent[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const randomMinutes = Math.floor(Math.random() * 10000) + 5;
    const timestamp = new Date(now.getTime() - randomMinutes * 60 * 1000);

    events.push({
      id: `deploy-${i + 1}`,
      botName: botNames[Math.floor(Math.random() * botNames.length)],
      status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp,
      duration: statusOptions[Math.floor(Math.random() * statusOptions.length)] === 'in_progress'
        ? 0
        : Math.floor(Math.random() * 180) + 5,
      trigger: triggers[Math.floor(Math.random() * triggers.length)],
      version: versions[Math.floor(Math.random() * versions.length)],
      logs: generateMockLogs(statusOptions[Math.floor(Math.random() * statusOptions.length)]),
    });
  }

  // Sort by timestamp descending (newest first)
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return events;
}

const allDeployments = generateDeploymentEvents();

// Chart data: deployments per day over last 7 days
const chartData = [
  { day: 'السبت', success: 12, failed: 2 },
  { day: 'الأحد', success: 18, failed: 3 },
  { day: 'الاثنين', success: 24, failed: 1 },
  { day: 'الثلاثاء', success: 15, failed: 4 },
  { day: 'الأربعاء', success: 21, failed: 2 },
  { day: 'الخميس', success: 28, failed: 5 },
  { day: 'الجمعة', success: 10, failed: 1 },
];

/* ─── Status Config ─── */

const statusConfig: Record<DeploymentStatus, {
  label: string;
  bgClass: string;
  borderClass: string;
  dotClass: string;
  textClass: string;
  timelineColor: string;
}> = {
  success: {
    label: 'ناجح',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    textClass: 'text-emerald-400',
    timelineColor: 'bg-emerald-400',
  },
  failed: {
    label: 'فشل',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-400',
    textClass: 'text-red-400',
    timelineColor: 'bg-red-400',
  },
  in_progress: {
    label: 'قيد التنفيذ',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-400',
    timelineColor: 'bg-amber-400',
  },
  rolled_back: {
    label: 'تم التراجع',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-500/30',
    dotClass: 'bg-sky-400',
    textClass: 'text-sky-400',
    timelineColor: 'bg-sky-400',
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
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  rollback: {
    label: 'تراجع',
    icon: RotateCcw,
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  stop: {
    label: 'إيقاف',
    icon: Terminal,
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};

/* ─── Relative Time Helper ─── */

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

/* ─── Stats Card Component ─── */

function StatsCard({
  title,
  value,
  unit,
  change,
  changeDirection,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  badgeText,
  badgeClass,
}: {
  title: string;
  value: string | number;
  unit?: string;
  change: string;
  changeDirection: 'up' | 'down';
  icon: typeof Rocket;
  iconBgClass: string;
  iconColorClass: string;
  badgeText?: string;
  badgeClass?: string;
}) {
  return (
    <Card className="bg-card border-border rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center size-10 rounded-xl ${iconBgClass}`}>
              <Icon className={`size-5 ${iconColorClass}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5">
                {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
                {unit && <span className="text-sm font-normal text-muted-foreground mr-1">{unit}</span>}
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
    </Card>
  );
}

/* ─── Timeline Entry Component ─── */

function TimelineEntry({
  event,
  index,
}: {
  event: DeploymentEvent;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[event.status];
  const eventConfig = eventTypeConfig[event.eventType];
  const EventIcon = eventConfig.icon;

  return (
    <motion.div
      variants={timelineItemVariants}
      className="relative flex gap-4 pb-6 last:pb-0 group"
    >
      {/* Timeline Line & Dot */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-3 rounded-full ${config.timelineColor} ring-4 ring-background z-10 shrink-0`} />
        {index < allDeployments.length - 1 && (
          <div className="w-px flex-1 bg-border/50 mt-1" />
        )}
      </div>

      {/* Content Card */}
      <div className="flex-1 min-w-0">
        <Card className="bg-card border-border rounded-xl hover:border-primary/20 transition-all duration-200 overflow-hidden">
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
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
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
                  إخفاء السجلات
                </>
              ) : (
                <>
                  <ChevronDown className="size-3" />
                  عرض السجلات
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
                  <div className="mt-2 rounded-lg bg-muted/50 border border-border/50 p-3 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto space-y-0.5" dir="ltr">
                    {event.logs.map((log, logIndex) => (
                      <p
                        key={logIndex}
                        className={
                          log.includes('[ERROR]') ? 'text-red-400' :
                          log.includes('[WARN]') ? 'text-amber-400' :
                          log.includes('[SUCCESS]') ? 'text-emerald-400' :
                          'text-muted-foreground'
                        }
                      >
                        {log}
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

/* ─── Main DeploymentHistory Component ─── */

export function DeploymentHistory() {
  const [selectedBot, setSelectedBot] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [visibleCount, setVisibleCount] = useState(10);

  // Filter deployments based on selected filters
  const filteredDeployments = useMemo(() => {
    let filtered = [...allDeployments];

    // Date range filter
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

    // Bot filter
    if (selectedBot !== 'all') {
      filtered = filtered.filter((d) => d.botName === selectedBot);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    return filtered;
  }, [selectedBot, selectedStatus, dateRange]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = filteredDeployments.length;
    const successCount = filteredDeployments.filter((d) => d.status === 'success').length;
    const failedCount = filteredDeployments.filter((d) => d.status === 'failed').length;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '0.0';
    const avgDeployTime = filteredDeployments
      .filter((d) => d.duration > 0)
      .reduce((sum, d) => sum + d.duration, 0) / Math.max(filteredDeployments.filter((d) => d.duration > 0).length, 1);

    return {
      total,
      successRate,
      avgDeployTime: Math.round(avgDeployTime),
      failedCount,
    };
  }, [filteredDeployments]);

  // Visible deployments
  const visibleDeployments = filteredDeployments.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDeployments.length;

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

      {/* ─── Filter Bar ─── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Bot Selector */}
              <div className="flex-1">
                <label className="text-[11px] text-muted-foreground mb-1.5 block">البوت</label>
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger className="w-full bg-muted/30 border-border text-sm">
                    <SelectValue placeholder="جميع البوتات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع البوتات</SelectItem>
                    {botNames.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="sm:w-44">
                <label className="text-[11px] text-muted-foreground mb-1.5 block">الحالة</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-muted/30 border-border text-sm">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="success">ناجح</SelectItem>
                    <SelectItem value="failed">فشل</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="rolled_back">تم التراجع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="sm:w-44">
                <label className="text-[11px] text-muted-foreground mb-1.5 block">الفترة الزمنية</label>
                <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                  <SelectTrigger className="w-full bg-muted/30 border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">آخر 7 أيام</SelectItem>
                    <SelectItem value="30days">آخر 30 يوم</SelectItem>
                    <SelectItem value="90days">آخر 90 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Stats Cards ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="إجمالي عمليات النشر"
          value={stats.total}
          change="14.2%"
          changeDirection="up"
          icon={Rocket}
          iconBgClass="bg-primary/15"
          iconColorClass="text-primary"
        />
        <StatsCard
          title="معدل النجاح"
          value={stats.successRate}
          unit="%"
          change="2.1%"
          changeDirection="up"
          icon={CheckCircle2}
          iconBgClass="bg-emerald-500/15"
          iconColorClass="text-emerald-400"
          badgeText={Number(stats.successRate) >= 90 ? 'ممتاز' : Number(stats.successRate) >= 75 ? 'جيد' : 'يحتاج تحسين'}
          badgeClass={
            Number(stats.successRate) >= 90
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : Number(stats.successRate) >= 75
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
          }
        />
        <StatsCard
          title="متوسط وقت النشر"
          value={stats.avgDeployTime}
          unit="ثانية"
          change="8.5%"
          changeDirection="down"
          icon={Clock}
          iconBgClass="bg-amber-500/15"
          iconColorClass="text-amber-400"
        />
        <StatsCard
          title="عمليات النشر الفاشلة"
          value={stats.failedCount}
          change="5.3%"
          changeDirection="down"
          icon={XCircle}
          iconBgClass="bg-red-500/15"
          iconColorClass="text-red-400"
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
                  <span className="size-2.5 rounded-sm bg-emerald-400" />
                  <span className="text-muted-foreground">ناجح</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-red-400" />
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
                      <Cell key={`success-${index}`} fill="#34d399" />
                    ))}
                  </Bar>
                  <Bar dataKey="failed" name="فاشل" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`failed-${index}`} fill="#ef4444" />
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
              >
                {visibleDeployments.length > 0 ? (
                  visibleDeployments.map((event, index) => (
                    <TimelineEntry key={event.id} event={event} index={index} />
                  ))
                ) : (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-12"
                  >
                    <History className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">لا توجد عمليات نشر مطابقة للفلاتر المحددة</p>
                  </motion.div>
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
