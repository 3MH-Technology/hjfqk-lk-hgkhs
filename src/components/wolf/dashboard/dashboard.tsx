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
  BarChart3,
  Sparkles,
  Zap,
  Terminal,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  HardDrive,
  Wifi,
  Globe,
  Server,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import type { Page } from '@/store/app-store';
import { CreateBotDialog } from '@/components/wolf/bots/create-bot-dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

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

const WOLF_LOGO = 'https:

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
  navPage: Page;
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
    navPage: 'bots',
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
    navPage: 'bot-monitoring',
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
    navPage: 'bots',
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
    navPage: 'bot-monitoring',
  },
  {
    key: 'totalFiles',
    label: 'إجمالي الملفات',
    icon: FileText,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5',
    barColor: 'bg-sky-400',
    trend: 'up',
    navPage: 'files',
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
    navPage: 'logs',
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
    className: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    dotClass: 'bg-sky-400 pulse-dot',
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
    label: 'تحليلات البوتات',
    description: 'إحصائيات مفصلة وأداء',
    icon: BarChart3,
    page: 'bot-analytics',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-violet-500/5',
    iconColor: 'text-violet-400',
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

const quickStartSteps: {
  step: number;
  emoji: string;
  title: string;
  description: string;
}[] = [
  {
    step: 1,
    emoji: '📝',
    title: 'أنشئ حسابك',
    description: 'سجل في أقل من دقيقة وابدأ فوراً',
  },
  {
    step: 2,
    emoji: '🤖',
    title: 'أنشئ بوتك الأول',
    description: 'ارفع ملفات البوت وأعد متغيرات البيئة',
  },
  {
    step: 3,
    emoji: '▶️',
    title: 'شغّل بوتك',
    description: 'اضغط زر التشغيل وسيبدأ العمل فوراً',
  },
  {
    step: 4,
    emoji: '📊',
    title: 'راقب الأداء',
    description: 'تتبع استهلاك الموارد والسجلات مباشرة',
  },
];

/* ─── Live Activity Feed Data ─── */

interface LiveActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  description: string;
  time: string;
}

const liveActivityPool: LiveActivityItem[] = [
  { id: 'la-1', type: 'success', description: 'تم تشغيل بوت @mybot بنجاح', time: 'منذ 2 دقيقة' },
  { id: 'la-2', type: 'info', description: 'تم إنشاء حساب جديد — user_2024', time: 'منذ 5 دقائق' },
  { id: 'la-3', type: 'warning', description: 'تحديث إعدادات البوت — @storebot', time: 'منذ 8 دقائق' },
  { id: 'la-4', type: 'error', description: 'فشل تشغيل بوت @gamebot — خطأ في المنفذ', time: 'منذ 12 دقيقة' },
  { id: 'la-5', type: 'success', description: 'تم نشر تحديث جديد لبوت @assistbot', time: 'منذ 15 دقيقة' },
  { id: 'la-6', type: 'info', description: 'تم رفع 5 ملفات جديدة لبوت @shopbot', time: 'منذ 20 دقيقة' },
  { id: 'la-7', type: 'success', description: 'تم إعادة تشغيل بوت @notifybot', time: 'منذ 25 دقيقة' },
  { id: 'la-8', type: 'warning', description: 'استخدام الذاكرة مرتفع — @gamebot 92%', time: 'منذ 30 دقيقة' },
  { id: 'la-9', type: 'info', description: 'تم تغيير متغيرات البيئة لبوت @paybot', time: 'منذ 35 دقيقة' },
  { id: 'la-10', type: 'success', description: 'تم إنشاء بوت جديد — @musicbot', time: 'منذ 40 دقيقة' },
];

const newActivityPool: LiveActivityItem[] = [
  { id: 'new-1', type: 'success', description: 'تم تشغيل بوت @cronbot بنجاح', time: 'الآن' },
  { id: 'new-2', type: 'info', description: 'تحديث النظام إلى الإصدار 2.4.1', time: 'الآن' },
  { id: 'new-3', type: 'warning', description: 'تنبيه: استخدام وحدة المعالجة مرتفع 78%', time: 'الآن' },
  { id: 'new-4', type: 'error', description: 'انقطاع مؤقت في اتصال WebSocket', time: 'الآن' },
  { id: 'new-5', type: 'success', description: 'تم النسخ الاحتياطي لقاعدة البيانات', time: 'الآن' },
  { id: 'new-6', type: 'info', description: 'مستخدم جديد سجّل في المنصة', time: 'الآن' },
  { id: 'new-7', type: 'success', description: 'تم ترقية خطة المستخدم user_pro', time: 'الآن' },
  { id: 'new-8', type: 'warning', description: 'شهادة SSL ستنتهي خلال 7 أيام', time: 'الآن' },
];

const activityIconConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  info: { icon: Wifi, color: 'text-sky-400', bg: 'bg-sky-500/15' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15' },
};

/* ─── System Status Data ─── */

interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  icon: typeof Server;
}

const systemServices: SystemService[] = [
  { name: 'API Server', status: 'operational', icon: Server },
  { name: 'Database', status: 'operational', icon: Database },
  { name: 'Docker Engine', status: 'operational', icon: Cpu },
  { name: 'WebSocket', status: 'operational', icon: MessageSquare },
  { name: 'CDN', status: 'operational', icon: Globe },
  { name: 'Redis Cache', status: 'operational', icon: Zap },
];

/* ─── SVG Color Map for Sparklines ─── */

const sparklineColorMap: Record<string, string> = {
  'bg-sky-400': '#38bdf8',
  'bg-emerald-400': '#34d399',
  'bg-zinc-400': '#a1a1aa',
  'bg-red-400': '#f87171',
};

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

/* ─── SVG Sparkline Chart Component ─── */
function SparklineChart({ data, barColorClass }: { data: number[]; barColorClass: string }) {
  const color = sparklineColorMap[barColorClass] || '#38bdf8';
  const width = 120;
  const height = 32;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x, y };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradId = `spark-grad-${barColorClass.replace(/[^a-z0-9]/g, '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} opacity="0.9" />
    </svg>
  );
}

/* ─── Resource Progress Bar Component ─── */
function ResourceProgressBar({
  label,
  value,
  max,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: typeof Cpu;
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      <span className="w-6 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' as const }}
        />
      </div>
      <span className="w-7 text-left tabular-nums">{percentage}%</span>
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
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const }}
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
        transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' as const }}
      >
        {message}
      </motion.p>
      {subMessage && (
        <motion.p
          className="text-muted-foreground text-sm mt-2 max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' as const }}
        >
          {subMessage}
        </motion.p>
      )}
      {showButton && onButtonClick && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' as const }}
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
      <div className="flex-1 h-px bg-gradient-to-l from-primary/25 via-primary/10 to-transparent" />
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
        <Icon className="size-3.5 text-primary/60" />
        <span className="text-[10px] text-primary/50 font-medium tracking-wide">{label}</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
    </motion.div>
  );
}

/* ─── Glassmorphism Stat Card with Animated Gradient Border ─── */

function GlassStatCard({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className="relative rounded-xl p-[1px] overflow-hidden group">
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'conic-gradient(from 0deg, oklch(0.60 0.20 250 / 60%), oklch(0.55 0.22 245 / 20%), oklch(0.70 0.12 240 / 40%), oklch(0.60 0.20 250 / 60%))',
          animation: 'cta-border-shift 4s linear infinite',
        }}
      />
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
      <Card
        className={`glass relative rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        onClick={onClick}
      >
        {children}
      </Card>
    </div>
  );
}

/* ─── Quick Action Card with Motion Hover ─── */

function QuickActionCard({
  action,
  onClick,
}: {
  action: (typeof quickActions)[number];
  onClick: () => void;
}) {
  const Icon = action.icon;
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' as const }}
    >
      <Card
        className={`group backdrop-blur-sm bg-card/60 bg-gradient-to-bl ${action.gradientFrom} ${action.gradientTo} border border-border rounded-xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer`}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-background/60 group-hover:bg-background/80 group-hover:scale-110 transition-all duration-300">
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
    </motion.div>
  );
}

/* ─── Live Activity Feed Item ─── */

const liveFeedItemVariants: Variants = {
  initial: { opacity: 0, x: -30, height: 0 },
  animate: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    x: 30,
    height: 0,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  },
};

function LiveActivityFeedItem({ item }: { item: LiveActivityItem }) {
  const config = activityIconConfig[item.type];
  const Icon = config.icon;
  return (
    <motion.div
      variants={liveFeedItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
      className="flex items-start gap-3 group"
    >
      <div className={`flex items-center justify-center size-8 rounded-lg ${config.bg} shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`size-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors truncate">
          {item.description}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
          <Clock className="size-2.5" />
          {item.time}
        </p>
      </div>
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
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>(liveActivityPool.slice(0, 8));
  const [systemLastChecked, setSystemLastChecked] = useState(new Date());

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

  /* ─── Auto-refresh Live Activity Feed (every 8-12s) ─── */
  const newActivityIdx = useRef(0);
  useEffect(() => {
    const addNewActivity = () => {
      const newItem = newActivityPool[newActivityIdx.current % newActivityPool.length];
      newActivityIdx.current += 1;
      const uniqueItem = { ...newItem, id: `${newItem.id}-${Date.now()}` };
      setLiveActivities((prev) => [uniqueItem, ...prev.slice(0, 9)]);
    };
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 4000;
      return setTimeout(() => {
        addNewActivity();
        scheduleNext();
      }, delay);
    };
    const timeout = scheduleNext();
    return () => clearTimeout(timeout);
  }, []);

  /* ─── Auto-refresh System Status timestamp (every 30s) ─── */
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLastChecked(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleQuickAction = (action: (typeof quickActions)[number]) => {
    if (action.page === 'bots') {
      setCreateDialogOpen(true);
    } else {
      setCurrentPage(action.page);
    }
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

  const getSimulatedResource = useCallback((botId: string, type: 'cpu' | 'ram') => {
    let hash = 0;
    for (let i = 0; i < botId.length; i++) {
      hash = ((hash << 5) - hash + botId.charCodeAt(i)) | 0;
    }
    const base = type === 'cpu' ? 15 : 25;
    const range = type === 'cpu' ? 55 : 50;
    return Math.abs(hash % range) + base;
  }, []);

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
        className="relative overflow-hidden rounded-2xl glass border border-primary/20 p-6 sm:p-8"
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
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                  مرحباً بك، {userName}!
                </h1>
                {/* Real-time status indicator */}
                <motion.div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' as const }}
                >
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    <span className="relative rounded-full size-2 bg-emerald-400" />
                  </span>
                  <span className="text-[10px] font-medium text-emerald-400">متصل</span>
                </motion.div>
              </div>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                إليك ملخص نشاطك اليوم — نظرة سريعة على بوتاتك وإحصائياتك
              </p>
              <p className="text-muted-foreground/60 mt-1 text-xs flex items-center gap-1.5">
                <Clock className="size-3" />
                {todayDate}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage('logs')}
                className="gap-2 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <ScrollText className="size-4" />
                عرض السجلات
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Plus className="size-4" />
                إنشاء بوت
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ─── Full Empty State ─── */}
      {hasNoData ? (
        <motion.div variants={itemVariants}>
          <Card className="glass rounded-2xl overflow-hidden">
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
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.label}
                  action={action}
                  onClick={() => handleQuickAction(action)}
                />
              ))}
            </div>
          </motion.div>

          {/* ─── Quick Start Steps Guide ─── */}
          <motion.div variants={itemVariants} className="mt-6">
            <SectionDivider icon={BookOpen} label="خطوات البدء السريع" />
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-4 space-y-0"
            >
              {quickStartSteps.map((step, idx) => {
                const isLast = idx === quickStartSteps.length - 1;
                return (
                  <motion.div
                    key={step.step}
                    variants={itemVariants}
                    className="relative flex items-stretch"
                  >
                    {/* Connecting line (right side for RTL) */}
                    <div className="flex flex-col items-center shrink-0 w-10">
                      {/* Step number circle */}
                      <motion.div
                        className="relative z-10 flex items-center justify-center size-10 rounded-full bg-primary/15 border-2 border-primary/40 shadow-lg shadow-primary/10"
                        whileHover={{ scale: 1.12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' as const }}
                      >
                        <span className="text-sm font-bold text-primary">{step.step}</span>
                      </motion.div>
                      {/* Gradient connecting line */}
                      {!isLast && (
                        <div className="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-primary/40 via-primary/20 to-primary/5" />
                      )}
                    </div>

                    {/* Step card content */}
                    <motion.div
                      className="flex-1 mb-4 mr-4"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2, ease: 'easeOut' as const }}
                    >
                      <Card className="glass rounded-xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                        <CardContent className="p-4 flex items-center gap-4">
                          <span className="text-2xl shrink-0">{step.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground">{step.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <>
          {/* ─── Gradient Section Divider ─── */}
          <motion.div variants={itemVariants} className="relative flex items-center gap-3 -my-1">
            <div className="flex-1 h-px bg-gradient-to-l from-primary/25 via-primary/10 to-transparent" />
            <div className="flex-1 h-px bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
          </motion.div>

          {/* ─── Stats Grid (Glassmorphism with Animated Gradient Borders) ─── */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {statsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))
              : stats &&
                statCards.map((card) => {
                  const Icon = card.icon;
                  const trendVal = getTrendValue(card.key, stats);
                  const bars = sparklineData[card.key] || [];
                  const isUp = card.trend === 'up';
                  return (
                    <motion.div key={card.key} variants={statCardVariants}>
                      <GlassStatCard onClick={() => setCurrentPage(card.navPage)}>
                        <CardContent className="p-4 relative z-20">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div
                                className={`flex items-center justify-center size-11 rounded-xl ${card.iconBg}`}
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                transition={{ duration: 0.25, ease: 'easeOut' as const }}
                              >
                                <Icon className={`size-5 ${card.iconColor}`} />
                              </motion.div>
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
                              {isUp ? '↑' : '↓'} {trendVal}%
                            </div>
                          </div>
                          <SparklineChart data={bars} barColorClass={card.barColor} />
                        </CardContent>
                      </GlassStatCard>
                    </motion.div>
                  );
                })}
          </motion.div>

          {/* ─── Quick Actions Divider ─── */}
          <SectionDivider icon={Activity} label="إجراءات سريعة" />

          {/* ─── Quick Actions Grid ─── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.label}
                  action={action}
                  onClick={() => handleQuickAction(action)}
                />
              ))}
            </div>
          </motion.div>

          {/* ─── Status Summary ─── */}
          {!loading && bots.length > 0 && stats && (
            <>
              <SectionDivider icon={Zap} label="ملخص الحالة" />

              <motion.div variants={itemVariants}>
                <Card className="glass rounded-xl">
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
                              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' as const }}
                            />
                          )}
                          {stats.stoppedBots > 0 && (
                            <motion.div
                              className="bg-zinc-400 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(stats.stoppedBots / stats.totalBots) * 100}%`,
                              }}
                              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' as const }}
                            />
                          )}
                          {stats.errorBots > 0 && (
                            <motion.div
                              className="bg-red-400 h-full"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(stats.errorBots / stats.totalBots) * 100}%`,
                              }}
                              transition={{ duration: 1, delay: 0.7, ease: 'easeOut' as const }}
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
                        <div className="bg-background/60 rounded-lg p-3 text-center border border-border/50 hover:border-primary/20 transition-colors">
                          <p className="text-xl font-bold text-emerald-400">
                            <AnimatedCounter target={stats.runningBots} />
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">يعمل الآن</p>
                        </div>
                        <div className="bg-background/60 rounded-lg p-3 text-center border border-border/50 hover:border-primary/20 transition-colors">
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

          {/* ─── Recent Bots (with Resource Usage Bars) ─── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="size-4 text-primary" />
                </div>
                البوتات الأخيرة
              </h2>
              {bots.length > 0 && (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage('bots')}
                    className="text-primary hover:text-primary/80"
                  >
                    عرض الكل
                    <ChevronLeft className="size-4 mr-1" />
                  </Button>
                </motion.div>
              )}
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 w-72 shrink-0 rounded-xl" />
                ))}
              </div>
            ) : recentBots.length === 0 ? (
              <Card className="glass rounded-xl">
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
                  const cpuUsage = getSimulatedResource(bot.id, 'cpu');
                  const ramUsage = getSimulatedResource(bot.id, 'ram');
                  return (
                    <motion.div
                      key={bot.id}
                      custom={idx}
                      variants={botCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25, ease: 'easeOut' as const }}
                    >
                      <Card
                        className="shrink-0 w-72 backdrop-blur-sm bg-card/60 border border-border rounded-xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer snap-start"
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

                          {/* Resource usage mini progress bars */}
                          {bot.status === 'running' && (
                            <div className="space-y-1.5 pt-1">
                              <ResourceProgressBar
                                label="CPU"
                                value={cpuUsage}
                                max={100}
                                color="bg-emerald-400"
                                icon={Cpu}
                              />
                              <ResourceProgressBar
                                label="RAM"
                                value={ramUsage}
                                max={100}
                                color="bg-sky-400"
                                icon={HardDrive}
                              />
                            </div>
                          )}

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

          {/* ─── Activity Feed + System Status Divider ─── */}
          <SectionDivider icon={MessageSquare} label="النشاط والنظام" />

          {/* ─── Live Activity Feed + System Status Grid ─── */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Live Activity Feed (wider) */}
              <Card className="glass rounded-xl lg:col-span-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="size-4 text-primary" />
                      آخر الأنشطة
                    </h3>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                      >
                        <span className="relative flex size-1.5">
                          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                          <span className="relative rounded-full size-1.5 bg-emerald-400" />
                        </span>
                        <span className="text-[10px] font-medium text-emerald-400">مباشر</span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage('activity-center')}
                          className="text-primary hover:text-primary/80 text-xs h-7"
                        >
                          عرض الكل
                          <ChevronLeft className="size-3.5 mr-0.5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  <div className="max-h-[340px] overflow-y-auto custom-scrollbar space-y-0">
                    <AnimatePresence mode="popLayout">
                      {liveActivities.map((item, idx) => (
                        <div key={item.id}>
                          <LiveActivityFeedItem item={item} />
                          {idx < liveActivities.length - 1 && (
                            <div className="h-px bg-border/30 my-2 mr-11" />
                          )}
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* System Status Widget (narrower) */}
              <Card className="glass rounded-xl lg:col-span-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary" />
                      حالة النظام
                    </h3>
                    <motion.div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                    >
                      <span className="relative flex size-1.5">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative rounded-full size-1.5 bg-emerald-400" />
                      </span>
                      <span className="text-[10px] font-medium text-emerald-400">يعمل</span>
                    </motion.div>
                  </div>

                  {/* Overall Status */}
                  <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                    <span className="relative flex size-2.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <span className="relative rounded-full size-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-medium text-emerald-400">جميع الأنظمة تعمل</span>
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {systemServices.map((service) => {
                      const SvcIcon = service.icon;
                      const statusColor = service.status === 'operational' ? 'bg-emerald-400' : service.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
                      const statusText = service.status === 'operational' ? 'يعمل' : service.status === 'degraded' ? 'بطيء' : 'متوقف';
                      const statusTextColor = service.status === 'operational' ? 'text-emerald-400' : service.status === 'degraded' ? 'text-amber-400' : 'text-red-400';
                      return (
                        <div
                          key={service.name}
                          className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/40 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex items-center justify-center size-7 rounded-md bg-primary/10 shrink-0">
                            <SvcIcon className="size-3.5 text-primary/70" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium truncate">{service.name}</p>
                            <div className="flex items-center gap-1">
                              <span className={`size-1.5 rounded-full ${statusColor} shrink-0`} />
                              <span className={`text-[9px] ${statusTextColor}`}>{statusText}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Uptime + Last Checked */}
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">وقت التشغيل</span>
                      <span className="text-xs font-bold text-emerald-400 tabular-nums">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">آخر فحص</span>
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {systemLastChecked.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  >
                    <Card className="glass rounded-xl hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300">
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
                </motion.div>

                {/* Most Recent Bot */}
                <motion.div variants={statCardVariants}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  >
                    <Card
                      className="glass rounded-xl hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 cursor-pointer"
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
                </motion.div>

                {/* Navigate to Console */}
                <motion.div variants={statCardVariants}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' as const }}
                  >
                    <Card
                      className="glass rounded-xl hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 cursor-pointer"
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
              </motion.div>
            </>
          )}

          {/* ─── Quick Action Cards at Bottom ─── */}
          <SectionDivider icon={Zap} label="وصول سريع" />
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: 'easeOut' as const }}>
                <Card
                  className="group relative overflow-hidden rounded-xl border border-border cursor-pointer hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative p-5 flex flex-col items-center text-center gap-3">
                    <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                      <Bot className="size-7 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-emerald-400 transition-colors">إنشاء بوت جديد</p>
                      <p className="text-xs text-muted-foreground mt-1">أنشئ بوت تيليجرامك الأول مجاناً</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: 'easeOut' as const }}>
                <Card
                  className="group relative overflow-hidden rounded-xl border border-border cursor-pointer hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
                  onClick={() => setCurrentPage('help')}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative p-5 flex flex-col items-center text-center gap-3">
                    <div className="size-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-500/20 transition-all duration-300">
                      <BookOpen className="size-7 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-sky-400 transition-colors">عرض التوثيق</p>
                      <p className="text-xs text-muted-foreground mt-1">دليل شامل لاستخدام المنصة</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.25, ease: 'easeOut' as const }}>
                <Card
                  className="group relative overflow-hidden rounded-xl border border-border cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                  onClick={() => setCurrentPage('help')}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="relative p-5 flex flex-col items-center text-center gap-3">
                    <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                      <LifeBuoy className="size-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">تواصل مع الدعم</p>
                      <p className="text-xs text-muted-foreground mt-1">فريق الدعم متاح على مدار الساعة</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
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
