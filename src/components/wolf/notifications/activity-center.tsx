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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

/* ─── Types ─── */

type ActivityType = 'info' | 'success' | 'warning' | 'error';

type FilterTab = 'all' | ActivityType;

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string | null;
}

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
  { value: 'info', label: 'معلومات', icon: Info },
  { value: 'success', label: 'نجاح', icon: CheckCircle2 },
  { value: 'warning', label: 'تحذير', icon: AlertTriangle },
  { value: 'error', label: 'خطأ', icon: XCircle },
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
    transition: { duration: 0.35, ease: 'easeOut' },
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
    transition: { duration: 0.4, ease: 'easeOut' },
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

/* ─── Main Component ─── */

export default function ActivityCenter() {
  const { setUnreadNotifications } = useAppStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ─── Fetch Notifications ─── */

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const items: ActivityItem[] = data.map((n: { id: string; type: string; title: string; message: string; read: boolean; link?: string | null; createdAt: string }) => ({
          id: n.id,
          type: (n.type as ActivityType) || 'info',
          title: n.title,
          message: n.message,
          timestamp: n.createdAt,
          read: n.read,
          link: n.link,
        }));
        setActivities(items);
        const unread = items.filter((a) => !a.read).length;
        setUnreadNotifications(unread);
      }
    } catch {
      // Silently fail
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

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = activeFilter === 'all' || activity.type === activeFilter;
      const matchesRead = showUnreadOnly ? !activity.read : true;
      return matchesType && matchesRead;
    });
  }, [activities, activeFilter, showUnreadOnly]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: activities.length,
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
    };
    activities.forEach((a) => {
      counts[a.type]++;
    });
    return counts;
  }, [activities]);

  /* ─── Handlers ─── */

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
        setUnreadNotifications(0);
        toast.success('تم تعليم جميع الإشعارات كمقروءة');
      }
    } catch {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setActivities((prev) => {
          const updated = prev.map((a) => (a.id === id ? { ...a, read: true } : a));
          const newUnread = updated.filter((a) => !a.read).length;
          setUnreadNotifications(newUnread);
          return updated;
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleClearAll = () => {
    setActivities([]);
    setUnreadNotifications(0);
    toast.success('تم مسح جميع الإشعارات');
  };

  /* ─── Empty State ─── */

  if (!loading && activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="bg-card border border-border rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="flex items-center justify-center size-20 rounded-2xl bg-primary/10">
                <BellOff className="size-10 text-primary/40" />
              </div>
              <div className="absolute -top-1 -right-1 size-6 rounded-full bg-border/50 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">0</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              جميع الإشعارات السابقة تم مسحها. ستظهر الإشعارات الجديدة هنا تلقائياً.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="size-3.5" />
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
          {/* Decorative accent line */}
          <div className="h-[2px] w-full bg-gradient-to-l from-primary/60 via-primary/20 to-transparent" />

          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Title & subtitle */}
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center size-12 rounded-xl bg-primary/10 shrink-0">
                  <Bell className="size-6 text-primary" />
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -left-1.5 flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold border-2 border-card notification-badge-pulse"
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

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* Refresh */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="gap-2 text-xs border-border hover:border-primary/30 hover:text-primary"
                >
                  <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>

                {/* Show unread toggle */}
                <Button
                  variant={showUnreadOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`gap-2 text-xs ${
                    showUnreadOnly
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Eye className="size-3.5" />
                  {showUnreadOnly ? 'الكل' : 'غير المقروء فقط'}
                </Button>

                {/* Mark all as read */}
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

                {/* Clear all */}
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

      {/* ─── Filter Tabs ─── */}
      <motion.div variants={headerVariants}>
        <Tabs
          value={activeFilter}
          onValueChange={(val) => setActiveFilter(val as FilterTab)}
          className="w-full"
        >
          <TabsList className="w-full bg-card/80 border border-border rounded-xl h-auto p-1.5 gap-1">
            {filterTabs.map((tab) => {
              const TabIcon = tab.icon;
              const count = filterCounts[tab.value];
              const isActive = activeFilter === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-primary/15 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  <TabIcon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] h-5 min-w-[20px] px-1.5 rounded-full ${
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
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
            {showUnreadOnly && (
              <Badge variant="outline" className="text-[11px] text-primary border-primary/25 bg-primary/10">
                <Eye className="size-3 ml-1" />
                عرض غير المقروء فقط
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
                ) : filteredActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex items-center justify-center size-14 rounded-2xl bg-muted/50 mb-4">
                      <Bell className="size-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium mb-1">
                      لا توجد إشعارات مطابقة
                    </p>
                    <p className="text-muted-foreground/60 text-xs">
                      جرب تغيير الفلتر أو إزالة خيار &quot;غير المقروء فقط&quot;
                    </p>
                  </div>
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
                        const config = typeConfig[activity.type];
                        const ActivityIcon = config.icon;
                        const isLast = index === filteredActivities.length - 1;

                        return (
                          <motion.div
                            key={activity.id}
                            variants={itemVariants}
                            layout
                            exit="exit"
                            className="relative"
                          >
                            {/* Activity Item */}
                            <div
                              className={`
                                group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl
                                transition-all duration-200 cursor-pointer
                                hover:bg-accent/30
                                ${!activity.read ? 'bg-accent/10' : ''}
                                ${!isLast ? '' : ''}
                              `}
                              onClick={() => {
                                if (!activity.read) handleMarkAsRead(activity.id);
                              }}
                            >
                              {/* Left color bar indicator */}
                              <div
                                className={`absolute top-3 bottom-3 left-0 w-[3px] rounded-full transition-all duration-200 ${
                                  activity.read
                                    ? `${config.barColor}/30`
                                    : `${config.barColor}`
                                } group-hover:${config.barColor}`}
                              />

                              {/* Timeline dot + icon container */}
                              <div className="relative shrink-0 z-10">
                                <div
                                  className={`
                                    flex items-center justify-center size-10 sm:size-11 rounded-xl
                                    transition-all duration-200
                                    ${config.iconBg}
                                    group-hover:scale-110
                                    ${!activity.read ? `ring-2 ring-primary/20 ${config.glowColor} shadow-md` : ''}
                                  `}
                                >
                                  <ActivityIcon className={`size-4.5 sm:size-5 ${config.iconColor}`} />
                                </div>
                                {/* Timeline connector dot */}
                                <div
                                  className={`
                                    absolute top-1/2 right-1/2 translate-x-1/2 translate-y-1/2
                                    size-2.5 rounded-full border-[3px] border-card
                                    ${config.barColor}
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
                                    {/* Title row */}
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
                                      {/* Type badge */}
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 h-5 rounded-full shrink-0 ${config.badgeClass}`}
                                      >
                                        {config.label}
                                      </Badge>
                                      {!activity.read && (
                                        <div className="size-2 rounded-full bg-primary shrink-0 notification-badge-pulse" />
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
                                      {activity.message}
                                    </p>

                                    {/* Meta info row */}
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                      {/* Timestamp */}
                                      <span
                                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60"
                                        title={formatFullDate(activity.timestamp)}
                                      >
                                        <Clock className="size-3" />
                                        {formatRelativeTime(activity.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Separator between items */}
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
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <div className="size-2 rounded-full bg-sky-400" />
                معلومات
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <div className="size-2 rounded-full bg-emerald-400" />
                نجاح
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <div className="size-2 rounded-full bg-blue-400" />
                تحذير
              </span>
              <span className="flex items-center gap-1 text-muted-foreground/50">
                <div className="size-2 rounded-full bg-red-400" />
                خطأ
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
