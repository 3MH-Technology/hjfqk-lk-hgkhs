'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Bell,
  BellOff,
  Bot,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Trash2,
  Clock,
  Filter,
  CheckCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Users,
  MonitorUp,
  Settings,
  CircleDot,
  Check,
  Square,
  BellRing,
  SearchX,
  Inbox,
  MousePointerClick,
  Undo2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/* ─── Types ─── */

type ActivityType = 'info' | 'success' | 'warning' | 'error';
type ActivityCategory = 'system' | 'bots' | 'security' | 'team' | 'updates';
type FilterTab = 'all' | ActivityCategory;

interface ActivityItem {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionType?: 'view_bot' | 'view_details' | 'cancel';
}

/* ─── Category Config ─── */

const categoryConfig: Record<
  ActivityCategory,
  { label: string; icon: typeof Bell; color: string; bgClass: string; badgeClass: string }
> = {
  system: {
    label: 'النظام',
    icon: Settings,
    color: 'text-slate-400',
    bgClass: 'bg-slate-500/15',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  },
  bots: {
    label: 'البوتات',
    icon: Bot,
    color: 'text-sky-400',
    bgClass: 'bg-sky-500/15',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  },
  security: {
    label: 'الأمان',
    icon: Shield,
    color: 'text-red-400',
    bgClass: 'bg-red-500/15',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
  team: {
    label: 'الفريق',
    icon: Users,
    color: 'text-violet-400',
    bgClass: 'bg-violet-500/15',
    badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  },
  updates: {
    label: 'التحديثات',
    icon: MonitorUp,
    color: 'text-emerald-400',
    bgClass: 'bg-emerald-500/15',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  },
};

/* ─── Type Config ─── */

const typeConfig: Record<
  ActivityType,
  {
    label: string;
    icon: typeof Bell;
    iconBg: string;
    iconColor: string;
    barColor: string;
    badgeClass: string;
    glowColor: string;
  }
> = {
  info: {
    label: 'معلومات',
    icon: Info,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    barColor: 'bg-sky-400',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    glowColor: 'shadow-sky-500/10',
  },
  success: {
    label: 'نجاح',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    barColor: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    glowColor: 'shadow-emerald-500/10',
  },
  warning: {
    label: 'تحذير',
    icon: AlertTriangle,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    barColor: 'bg-blue-400',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    glowColor: 'shadow-blue-500/10',
  },
  error: {
    label: 'خطأ',
    icon: XCircle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    barColor: 'bg-red-400',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/25',
    glowColor: 'shadow-red-500/10',
  },
};

/* ─── Filter Tab Config ─── */

const filterTabs: { value: FilterTab; label: string; icon: typeof Bell }[] = [
  { value: 'all', label: 'الكل', icon: Filter },
  { value: 'system', label: 'النظام', icon: Settings },
  { value: 'bots', label: 'البوتات', icon: Bot },
  { value: 'security', label: 'الأمان', icon: Shield },
  { value: 'team', label: 'الفريق', icon: Users },
  { value: 'updates', label: 'التحديثات', icon: MonitorUp },
];

/* ─── Animation Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

/* ─── Relative Time Formatter ─── */

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'الآن';
  if (diffMin < 60)
    return diffMin === 1 ? 'منذ دقيقة' : `منذ ${diffMin} دقيقة`;
  if (diffHours < 24)
    return diffHours === 1 ? 'منذ ساعة' : `منذ ${diffHours} ساعة`;
  if (diffDays < 7)
    return diffDays === 1 ? 'منذ يوم' : `منذ ${diffDays} يوم`;
  return format(date, 'dd MMM yyyy', { locale: ar });
}

function formatFullDate(dateStr: string): string {
  return format(new Date(dateStr), 'EEEE d MMMM yyyy HH:mm', { locale: ar });
}

/* ─── Mock Data Generator ─── */

function generateMockActivities(): ActivityItem[] {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'success',
      category: 'bots',
      title: 'تم نشر البوت بنجاح',
      description: 'تم نشر بوت "مساعد الدعم" بنجاح على الخادم. كل شيء يعمل بشكل طبيعي.',
      timestamp: new Date(now - 2 * 60 * 1000).toISOString(),
      read: false,
      actionLabel: 'عرض البوت',
      actionType: 'view_bot',
    },
    {
      id: '2',
      type: 'error',
      category: 'bots',
      title: 'فشل تشغيل البوت',
      description: 'تعذر تشغيل بوت "التواصل" بسبب خطأ في ملف الإعدادات. يرجى مراجعة الإعدادات والمحاولة مرة أخرى.',
      timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
      read: false,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '3',
      type: 'warning',
      category: 'security',
      title: 'محاولة تسجيل دخول مشبوهة',
      description: 'تم رصد 3 محاولات تسجيل دخول فاشلة من عنوان IP غير معروف. تم حظره تلقائياً.',
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      read: false,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '4',
      type: 'info',
      category: 'system',
      title: 'صيانة الخادم المجدولة',
      description: 'سيتم إجراء صيانة دورية يوم الجمعة القادم من الساعة 2:00 إلى 4:00 صباحاً. قد يتأثر بعض الخدمات.',
      timestamp: new Date(now - 2 * 3600 * 1000).toISOString(),
      read: false,
      actionLabel: 'إلغاء',
      actionType: 'cancel',
    },
    {
      id: '5',
      type: 'success',
      category: 'team',
      title: 'تمت دعوة عضو جديد',
      description: 'تمت دعوة أحمد محمد للانضمام إلى فريقك. في انتظار قبول الدعوة.',
      timestamp: new Date(now - 3 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: '6',
      type: 'info',
      category: 'updates',
      title: 'تحديث النظام v2.5.0',
      description: 'تم إصدار تحديث جديد يتضمن تحسينات في الأداء وإصلاحات للأخطاء. يُنصح بالتحديث.',
      timestamp: new Date(now - 5 * 3600 * 1000).toISOString(),
      read: false,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '7',
      type: 'success',
      category: 'bots',
      title: 'اكتمل النسخ الاحتياطي',
      description: 'تم إنشاء نسخة احتياطية كاملة لجميع بوتاتك بنجاح. حجم النسخة: 2.4 جيجابايت.',
      timestamp: new Date(now - 6 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: '8',
      type: 'warning',
      category: 'bots',
      title: 'استهلاك عالي للموارد',
      description: 'بوت "المحاسبة" يستهلك 85% من ذاكرة الخادم المخصصة. يُنصح بتحسين الكود أو ترقية الخطة.',
      timestamp: new Date(now - 8 * 3600 * 1000).toISOString(),
      read: false,
      actionLabel: 'عرض البوت',
      actionType: 'view_bot',
    },
    {
      id: '9',
      type: 'info',
      category: 'security',
      title: 'تم تفعيل المصادقة الثنائية',
      description: 'تم تفعيل المصادقة الثنائية بنجاح لحسابك. حسابك الآن أكثر أماناً.',
      timestamp: new Date(now - 12 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: '10',
      type: 'error',
      category: 'system',
      title: 'انقطاع مؤقت في الخدمة',
      description: 'تعطلت خدمة قاعدة البيانات لمدة 5 دقائق. تم استعادة الخدمة بالكامل.',
      timestamp: new Date(now - 18 * 3600 * 1000).toISOString(),
      read: true,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '11',
      type: 'success',
      category: 'team',
      title: 'تم قبول الدعوة',
      description: 'قبل سارة أحمد الدعوة وانضمت إلى فريقك. يمكنها الآن الوصول إلى البوتات المشتركة.',
      timestamp: new Date(now - 24 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: '12',
      type: 'info',
      category: 'updates',
      title: 'ميزة جديدة: وحدة التحكم',
      description: 'تمت إضافة وحدة تحكم تفاعلية للبوتات. يمكنك الآن تنفيذ أوامر مباشرة من المتصفح.',
      timestamp: new Date(now - 2 * 24 * 3600 * 1000).toISOString(),
      read: true,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '13',
      type: 'warning',
      category: 'system',
      title: 'مساحة التخزين منخفضة',
      description: 'تبقى 15% فقط من مساحة التخزين. يُنصح بحذف الملفات غير الضرورية أو ترقية الخطة.',
      timestamp: new Date(now - 3 * 24 * 3600 * 1000).toISOString(),
      read: true,
      actionLabel: 'عرض التفاصيل',
      actionType: 'view_details',
    },
    {
      id: '14',
      type: 'success',
      category: 'security',
      title: 'تم تحديث كلمة المرور',
      description: 'تم تغيير كلمة المرور بنجاح. إذا لم تقم بهذا التغيير، اتصل بالدعم فوراً.',
      timestamp: new Date(now - 4 * 24 * 3600 * 1000).toISOString(),
      read: true,
    },
    {
      id: '15',
      type: 'error',
      category: 'bots',
      title: 'تجاوز حد الطلبات',
      description: 'بوت "الإشعارات" تجاوز الحد اليومي للطلبات (10,000). سيتم استئناف الخدمة غداً.',
      timestamp: new Date(now - 5 * 24 * 3600 * 1000).toISOString(),
      read: true,
      actionLabel: 'عرض البوت',
      actionType: 'view_bot',
    },
    {
      id: '16',
      type: 'info',
      category: 'updates',
      title: 'تحديث واجهة المستخدم',
      description: 'تم تحديث واجهة المستخدم مع تحسينات في التصميم وإضافة وضع مضيء جديد.',
      timestamp: new Date(now - 6 * 24 * 3600 * 1000).toISOString(),
      read: true,
    },
  ];
}

/* ─── Statistics Component ─── */

function StatisticsSummary({
  total,
  unread,
  today,
  thisWeek,
}: {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}) {
  const stats = [
    {
      label: 'إجمالي الإشعارات',
      value: total,
      icon: Bell,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'غير المقروءة',
      value: unread,
      icon: BellRing,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      showBadge: unread > 0,
    },
    {
      label: 'اليوم',
      value: today,
      icon: CircleDot,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'هذا الأسبوع',
      value: thisWeek,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const StatIcon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={fadeInVariants}
            className="relative flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
          >
            <div className={`flex items-center justify-center size-9 sm:size-10 rounded-lg ${stat.bg} shrink-0`}>
              <StatIcon className={`size-4 sm:size-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-foreground">{stat.value}</span>
                {stat.showBadge && (
                  <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
            </div>
            {idx === 1 && unread > 0 && (
              <div className="absolute -top-1 -left-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                جديد
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Empty State Component ─── */

function EmptyState({ type }: { type: 'no_notifications' | 'all_read' | 'no_results' }) {
  const configs = {
    no_notifications: {
      icon: BellOff,
      title: 'لا توجد إشعارات',
      description: 'جميع الإشعارات السابقة تم مسحها. ستظهر الإشعارات الجديدة هنا تلقائياً.',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary/40',
      showLink: true,
    },
    all_read: {
      icon: CheckCircle2,
      title: 'جميع الإشعارات مقروءة',
      description: 'لا توجد إشعارات غير مقروءة حالياً. أنت على اطلاع بكل شيء!',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400/60',
      showLink: true,
    },
    no_results: {
      icon: SearchX,
      title: 'لا توجد نتائج',
      description: 'لا توجد إشعارات تطابق الفلتر المحدد. جرب تغيير الفئة.',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400/60',
      showLink: true,
    },
  };

  const config = configs[type];
  const ConfigIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-5">
        <div className={`flex items-center justify-center size-16 rounded-2xl ${config.iconBg}`}>
          <ConfigIcon className={`size-8 ${config.iconColor}`} />
        </div>
      </div>
      <h3 className="text-base font-semibold mb-1.5">{config.title}</h3>
      <p className="text-sm text-muted-foreground/70 max-w-xs mb-4">{config.description}</p>
      {config.showLink && (
        <Button variant="link" size="sm" className="text-primary text-xs gap-1.5">
          <MousePointerClick className="size-3.5" />
          عرض كل الإشعارات
        </Button>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */

export default function ActivityCenter() {
  const { setUnreadNotifications, setCurrentPage, setSelectedBotId } = useAppStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  /* ─── Fetch Notifications ─── */

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const items: ActivityItem[] = data.map(
          (n: {
            id: string;
            type: string;
            title: string;
            message: string;
            read: boolean;
            link?: string | null;
            createdAt: string;
          }) => ({
            id: n.id,
            type: (n.type as ActivityType) || 'info',
            category: 'system' as ActivityCategory,
            title: n.title,
            description: n.message,
            timestamp: n.createdAt,
            read: n.read,
          })
        );
        setActivities(items);
        const unread = items.filter((a) => !a.read).length;
        setUnreadNotifications(unread);
      }
    } catch {
      // Use mock data as fallback
      const mockData = generateMockActivities();
      setActivities(mockData);
      const unread = mockData.filter((a) => !a.read).length;
      setUnreadNotifications(unread);
    } finally {
      setLoading(false);
    }
  }, [setUnreadNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ─── Derived State ─── */

  const unreadCount = useMemo(
    () => activities.filter((a) => !a.read).length,
    [activities]
  );

  const now = Date.now();
  const todayCount = useMemo(
    () => activities.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 24 * 3600 * 1000).length,
    [activities]
  );

  const thisWeekCount = useMemo(
    () => activities.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 7 * 24 * 3600 * 1000).length,
    [activities]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesCategory =
        activeFilter === 'all' || activity.category === activeFilter;
      return matchesCategory;
    });
  }, [activities, activeFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: activities.length,
      system: 0,
      bots: 0,
      security: 0,
      team: 0,
      updates: 0,
    };
    activities.forEach((a) => {
      counts[a.category]++;
    });
    return counts;
  }, [activities]);

  const isAllSelected =
    filteredActivities.length > 0 &&
    filteredActivities.every((a) => selectedIds.has(a.id));

  /* ─── Handlers ─── */

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotifications().finally(() => {
      setTimeout(() => setIsRefreshing(false), 600);
    });
  }, [fetchNotifications]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredActivities.map((a) => a.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkSelectedRead = () => {
    setActivities((prev) => {
      const updated = prev.map((a) =>
        selectedIds.has(a.id) ? { ...a, read: true } : a
      );
      const newUnread = updated.filter((a) => !a.read).length;
      setUnreadNotifications(newUnread);
      return updated;
    });
    toast.success(`تم تعليم ${selectedIds.size} إشعار كمقروء`);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    setActivities((prev) => {
      const remaining = prev.filter((a) => !selectedIds.has(a.id));
      const newUnread = remaining.filter((a) => !a.read).length;
      setUnreadNotifications(newUnread);
      return remaining;
    });
    toast.success(`تم حذف ${selectedIds.size} إشعار`);
    setSelectedIds(new Set());
  };

  const handleMarkAllRead = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadNotifications(0);
    setSelectedIds(new Set());
    toast.success('تم تعليم جميع الإشعارات كمقروءة');
  };

  const handleMarkAsRead = (id: string) => {
    setActivities((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a));
      const newUnread = updated.filter((a) => !a.read).length;
      setUnreadNotifications(newUnread);
      return updated;
    });
  };

  const handleAction = (activity: ActivityItem) => {
    if (activity.actionType === 'view_bot') {
      setSelectedBotId('demo-bot-1');
      setCurrentPage('bot-detail');
    }
    toast.info(activity.actionLabel || 'تم تنفيذ الإجراء');
  };

  const handleClearAll = () => {
    setActivities([]);
    setUnreadNotifications(0);
    setSelectedIds(new Set());
    toast.success('تم مسح جميع الإشعارات');
  };

  /* ─── Determine Empty State ─── */

  const getEmptyState = (): 'no_notifications' | 'all_read' | 'no_results' | null => {
    if (activities.length === 0) return 'no_notifications';
    if (filteredActivities.length === 0 && activeFilter !== 'all') return 'no_results';
    return null;
  };

  const emptyState = getEmptyState();

  /* ─── Empty State for Zero Activities ─── */

  if (!loading && activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
      >
        <Card className="bg-card border border-border rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <EmptyState type="no_notifications" />
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  /* ─── Render ─── */

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Header Card ─── */}
      <motion.div variants={headerVariants}>
        <Card className="bg-gradient-to-bl from-primary/8 via-card to-card border border-border rounded-xl overflow-hidden">
          <div className="h-[2px] w-full bg-gradient-to-l from-primary/60 via-primary/20 to-transparent" />
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center size-12 rounded-xl bg-primary/10 shrink-0">
                  <Bell className="size-6 text-primary" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -left-1.5 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold border-2 border-card"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                    مركز النشاط والإشعارات
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {unreadCount > 0
                      ? `لديك ${unreadCount} إشعار${unreadCount === 1 ? '' : ' غير مقروء'} جديد`
                      : 'جميع الإشعارات مقروءة'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="gap-2 text-xs border-border hover:border-primary/30 hover:text-primary"
                >
                  <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>

                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="gap-2 text-xs border-border hover:border-primary/30 hover:text-primary"
                  >
                    <CheckCheck className="size-3.5" />
                    تعيين الكل كمقروء
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-2 text-xs border-border hover:border-red-500/30 hover:text-red-400"
                >
                  <Trash2 className="size-3.5" />
                  مسح الكل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Statistics Summary Bar ─── */}
      <motion.div variants={headerVariants}>
        <StatisticsSummary
          total={activities.length}
          unread={unreadCount}
          today={todayCount}
          thisWeek={thisWeekCount}
        />
      </motion.div>

      {/* ─── Category Filter Tabs ─── */}
      <motion.div variants={headerVariants}>
        <Tabs
          value={activeFilter}
          onValueChange={(val) => {
            setActiveFilter(val as FilterTab);
            setSelectedIds(new Set());
          }}
          className="w-full"
        >
          <TabsList className="w-full bg-card/80 border border-border rounded-xl h-auto p-1.5 gap-1 overflow-x-auto scrollbar-none">
            {filterTabs.map((tab) => {
              const TabIcon = tab.icon;
              const count = categoryCounts[tab.value];
              const isActive = activeFilter === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-200 cursor-pointer whitespace-nowrap min-w-0
                    ${
                      isActive
                        ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  <TabIcon className="size-3.5 shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] h-5 min-w-[20px] px-1.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : count > 0
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted/50 text-muted-foreground/50'
                    }`}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* ─── Batch Actions Bar ─── */}
      {filteredActivities.length > 0 && (
        <motion.div variants={fadeInVariants}>
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleToggleSelectAll}
                  className="size-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs text-muted-foreground">تحديد الكل</span>
              </div>
              {selectedIds.size > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[11px] h-6 px-2 rounded-full bg-primary/15 text-primary"
                >
                  {selectedIds.size} محدد
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkSelectedRead}
                    className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 h-7 px-2"
                  >
                    <CheckCheck className="size-3.5" />
                    <span className="hidden sm:inline">تحديد المقروء</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSelected}
                    className="gap-1.5 text-xs text-red-400 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline">حذف المحدد</span>
                  </Button>
                </>
              )}
              <Separator orientation="vertical" className="h-4 bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Activity List ─── */}
      <motion.div variants={headerVariants}>
        <Card className="bg-card border border-border rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              سجل النشاط
              <Badge
                variant="secondary"
                className="text-[11px] h-5 px-2 rounded-full bg-muted"
              >
                {filteredActivities.length} عنصر
              </Badge>
            </CardTitle>
            {activeFilter !== 'all' && (
              <Badge variant="outline" className="text-[11px] text-primary border-primary/25 bg-primary/10">
                <Filter className="size-3 ml-1" />
                {filterTabs.find((t) => t.value === activeFilter)?.label}
              </Badge>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-2 sm:p-3">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-4 animate-pulse">
                      <Bell className="size-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                      جاري تحميل الإشعارات...
                    </p>
                  </div>
                ) : emptyState ? (
                  <EmptyState type={emptyState} />
                ) : (
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      className="relative"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Timeline vertical line */}
                      <div className="absolute top-4 right-[22px] sm:right-[24px] bottom-4 w-px bg-gradient-to-b from-primary/20 via-border to-transparent" />

                      {filteredActivities.map((activity, index) => {
                        const typeConf = typeConfig[activity.type];
                        const catConf = categoryConfig[activity.category];
                        const ActivityIcon = typeConf.icon;
                        const CatIcon = catConf.icon;
                        const isLast = index === filteredActivities.length - 1;
                        const isSelected = selectedIds.has(activity.id);

                        return (
                          <motion.div
                            key={activity.id}
                            variants={itemVariants}
                            layout
                            exit="exit"
                            className="relative"
                          >
                            <div
                              className={`
                                group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl
                                transition-all duration-200
                                hover:bg-accent/30
                                ${!activity.read ? 'bg-accent/10' : ''}
                                ${isSelected ? 'ring-1 ring-primary/30 bg-primary/5' : ''}
                              `}
                            >
                              {/* Left color bar indicator */}
                              <div
                                className={`absolute top-3 bottom-3 left-0 w-[3px] rounded-full transition-all duration-200 ${
                                  !activity.read
                                    ? typeConf.barColor
                                    : `${typeConf.barColor}/30`
                                }`}
                              />

                              {/* Selection checkbox */}
                              <div className="flex items-center pt-1 shrink-0">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleSelect(activity.id)}
                                  className={`size-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${
                                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  } transition-opacity duration-200`}
                                />
                              </div>

                              {/* Timeline dot + icon container */}
                              <div className="relative shrink-0 z-10">
                                <div
                                  className={`
                                    flex items-center justify-center size-10 sm:size-11 rounded-xl
                                    transition-all duration-200
                                    ${typeConf.iconBg}
                                    group-hover:scale-110
                                    ${!activity.read ? `ring-2 ring-primary/20 ${typeConf.glowColor} shadow-md` : ''}
                                  `}
                                >
                                  <ActivityIcon className={`size-4 sm:size-4.5 ${typeConf.iconColor}`} />
                                </div>
                                {/* Timeline connector dot */}
                                <div
                                  className={`
                                    absolute size-2.5 rounded-full border-[3px] border-card
                                    ${typeConf.barColor}
                                  `}
                                  style={{
                                    right: '-4px',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                  }}
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    {/* Title row with badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3
                                        className={`text-sm sm:text-[15px] leading-relaxed ${
                                          !activity.read
                                            ? 'font-bold text-foreground'
                                            : 'font-medium text-foreground/80'
                                        }`}
                                      >
                                        {activity.title}
                                      </h3>

                                      {/* Category badge */}
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 h-5 rounded-full shrink-0 gap-1 ${catConf.badgeClass}`}
                                      >
                                        <CatIcon className="size-2.5" />
                                        {catConf.label}
                                      </Badge>

                                      {/* Type badge */}
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 h-5 rounded-full shrink-0 ${typeConf.badgeClass}`}
                                      >
                                        {typeConf.label}
                                      </Badge>

                                      {/* Unread indicator */}
                                      {!activity.read && (
                                        <div className="size-2 rounded-full bg-primary shrink-0 animate-pulse" />
                                      )}
                                    </div>

                                    {/* Description */}
                                    <p
                                      className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                                        !activity.read
                                          ? 'text-muted-foreground'
                                          : 'text-muted-foreground/70'
                                      }`}
                                    >
                                      {activity.description}
                                    </p>

                                    {/* Meta info row */}
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                      <span
                                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60"
                                        title={formatFullDate(activity.timestamp)}
                                      >
                                        <Clock className="size-3" />
                                        {formatRelativeTime(activity.timestamp)}
                                      </span>

                                      {/* Action buttons */}
                                      {activity.actionLabel && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAction(activity);
                                          }}
                                          className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                          {activity.actionType === 'view_bot' && (
                                            <Bot className="size-3" />
                                          )}
                                          {activity.actionType === 'view_details' && (
                                            <Eye className="size-3" />
                                          )}
                                          {activity.actionType === 'cancel' && (
                                            <Undo2 className="size-3" />
                                          )}
                                          {activity.actionLabel}
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Mark read/unread toggle */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsRead(activity.id);
                                    }}
                                    className="h-7 w-7 p-0 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    title={activity.read ? 'تعليم كغير مقروء' : 'تعليم كمقروء'}
                                  >
                                    {activity.read ? (
                                      <EyeOff className="size-3.5" />
                                    ) : (
                                      <Eye className="size-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Separator */}
                            {!isLast && (
                              <div className="relative mx-12 sm:mx-14">
                                <Separator className="bg-border/40" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* ─── Footer ─── */}
          <Separator />
          <div className="flex items-center justify-between px-5 py-3 bg-muted/20">
            <p className="text-[11px] text-muted-foreground/60">
              إجمالي {activities.length} إشعار — {unreadCount} غير مقروء
            </p>
            <div className="flex items-center gap-3 text-[11px] overflow-x-auto scrollbar-none">
              <span className="flex items-center gap-1 text-muted-foreground/50 whitespace-nowrap">
                <div className="size-2 rounded-full bg-slate-400" />
                النظام
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50 whitespace-nowrap">
                <div className="size-2 rounded-full bg-sky-400" />
                البوتات
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50 whitespace-nowrap">
                <div className="size-2 rounded-full bg-red-400" />
                الأمان
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50 whitespace-nowrap">
                <div className="size-2 rounded-full bg-violet-400" />
                الفريق
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50 whitespace-nowrap">
                <div className="size-2 rounded-full bg-emerald-400" />
                التحديثات
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
