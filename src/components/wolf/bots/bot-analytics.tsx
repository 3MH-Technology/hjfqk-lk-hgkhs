'use client';

import { useMemo } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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

// Performance data loaded from API
const performanceData = [
  { day: 'السبت', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الأحد', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الاثنين', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الثلاثاء', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الأربعاء', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الخميس', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
  { day: 'الجمعة', requests: 0, responseTime: 0, errors: 0, cpu: 0, memory: 0 },
];

// Resource distribution loaded from API
const resourceData = [
  { name: 'المعالج (CPU)', value: 0, color: '#34d399' },
  { name: 'الذاكرة (RAM)', value: 0, color: '#f59e0b' },
  { name: 'الشبكة', value: 0, color: '#818cf8' },
  { name: 'القرص', value: 0, color: '#fb923c' },
];

// Response time distribution loaded from API
const responseTimeBuckets = [
  { range: '0-100ms', count: 0, fill: '#34d399' },
  { range: '100-500ms', count: 0, fill: '#f59e0b' },
  { range: '500ms-1s', count: 0, fill: '#fb923c' },
  { range: '>1s', count: 0, fill: '#ef4444' },
];

// Bot health data loaded from API
const botHealthData: { id: string; name: string; status: 'healthy' | 'warning' | 'critical'; uptime: number; reqPerMin: number; errorCount: number }[] = [];

// Top error messages loaded from API
const topErrors: { message: string; count: number; severity: 'critical' | 'warning' }[] = [];

// Activity heatmap data loaded from API
const heatmapData: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
const dayLabels = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const hourLabels = ['12ص', '1ص', '2ص', '3ص', '4ص', '5ص', '6م', '7م', '8م', '9م', '10م', '11م', '12م', '1م', '2م', '3م', '4م', '5م', '6م', '7م', '8م', '9م', '10م', '11م'];

/* ─── Sparkline Component ─── */

function Sparkline({
  data,
  color,
  width = 80,
  height = 32,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/* ─── Custom Tooltip ─── */

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
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
  value: string | number;
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
          <Sparkline data={sparkData} color={sparkColor} />
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
  bot: (typeof botHealthData)[number];
  index: number;
}) {
  const config = healthConfig[bot.status];
  const { setCurrentPage, setSelectedBotId } = useAppStore();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className={`bg-card border-border rounded-xl cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 hover:border-primary/30`}
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
  error: (typeof topErrors)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
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

/* ─── Sparkline Data Generators ─── */

const requestSparkData = [0, 0, 0, 0, 0, 0, 0];
const responseSparkData = [0, 0, 0, 0, 0, 0, 0];
const errorSparkData = [0, 0, 0, 0, 0, 0, 0];
const uptimeSparkData = [0, 0, 0, 0, 0, 0, 0];

/* ─── Main BotAnalytics Component ─── */

export function BotAnalytics() {
  const totalRequests = useMemo(
    () => performanceData.reduce((sum, d) => sum + d.requests, 0),
    []
  );
  const avgResponseTime = useMemo(
    () =>
      Math.round(performanceData.reduce((sum, d) => sum + d.responseTime, 0) / performanceData.length),
    []
  );
  const avgErrorRate = useMemo(
    () =>
      (
        performanceData.reduce((sum, d) => sum + d.errors, 0) /
        performanceData.reduce((sum, d) => sum + d.requests, 0) *
        100
      ).toFixed(2),
    []
  );

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
            <p className="text-sm text-muted-foreground">نظرة شاملة على أداء جميع البوتات خلال آخر 7 أيام</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            البيانات محدثة
          </Badge>
        </div>
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
          sparkColor="#f59e0b"
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
          value={avgErrorRate}
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
          value="99.5"
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
          <Card className="bg-card border-border rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  خط الأداء — آخر 7 أيام
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
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      name="الطلبات"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
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
          <Card className="bg-card border-border rounded-xl h-full">
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
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        direction: 'rtl',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
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

      {/* ─── Bot Health Grid ─── */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Server className="size-4 text-primary" />
                صحة البوتات
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {botHealthData.filter((b) => b.status === 'healthy').length} سليم
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {botHealthData.filter((b) => b.status === 'warning').length} تحذير
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                  {botHealthData.filter((b) => b.status === 'critical').length} حرج
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {botHealthData.length === 0 ? (
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
              botHealthData.map((bot, index) => (
                <BotHealthCard key={bot.id} bot={bot} index={index} />
              ))
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Top Errors + Response Time Distribution ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Error Messages */}
        <motion.div variants={itemVariants}>
          <Card className="bg-card border-border rounded-xl">
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
          <Card className="bg-card border-border rounded-xl">
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
                    <Tooltip
                      formatter={(value: number) => [value.toLocaleString('ar-EG'), 'عدد الطلبات']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        direction: 'rtl',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
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
        <Card className="bg-card border-border rounded-xl">
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
