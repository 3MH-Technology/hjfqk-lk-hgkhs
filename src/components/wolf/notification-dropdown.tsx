'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAppStore } from '@/store/app-store';

/* ─── Types ─── */

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  link?: string | null;
}

/* ─── Type Config ─── */

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof Bell;
    iconBg: string;
    iconColor: string;
    barColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    barColor: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    barColor: 'bg-red-400',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    barColor: 'bg-blue-400',
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    barColor: 'bg-sky-400',
  },
};

/* ─── Animation Variants ─── */

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: 12, height: 0 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: {
      delay: i * 0.04,
      duration: 0.25,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    x: -12,
    height: 0,
    transition: { duration: 0.15 },
  },
};

/* ─── Relative Time ─── */

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
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ─── Main Component ─── */

export function NotificationDropdown() {
  const { unreadNotifications, setUnreadNotifications, setCurrentPage } =
    useAppStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const items: NotificationItem[] = data.map((n: { id: string; type: string; title: string; message: string; read: boolean; link?: string | null; createdAt: string }) => ({
          id: n.id,
          type: (n.type as NotificationType) || 'info',
          title: n.title,
          message: n.message,
          timeAgo: formatRelativeTime(n.createdAt),
          read: n.read,
          link: n.link,
        }));
        setNotifications(items);
        const unread = items.filter((n) => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [setUnreadNotifications]);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const displayNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadNotifications(0);
      }
    } catch {
      // Silently fail
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const newUnread = updated.filter((n) => !n.read).length;
          setUnreadNotifications(newUnread);
          return updated;
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    setCurrentPage('activity');
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) handleMarkAsRead(notif.id);
    if (notif.link) {
      const pageMap: Record<string, string> = {
        'bot-detail': 'bot-detail',
        'bots': 'bots',
        'dashboard': 'dashboard',
        'settings': 'settings',
        'bot-monitoring': 'bot-monitoring',
        'bot-analytics': 'bot-analytics',
      };
      if (pageMap[notif.link]) {
        setCurrentPage(notif.link as 'bot-detail' | 'bots' | 'dashboard' | 'settings' | 'bot-monitoring' | 'bot-analytics');
        setOpen(false);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
          aria-label="الإشعارات"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white notification-badge-pulse min-w-[18px] h-[18px] px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-80 p-0 rounded-xl border border-border bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden"
      >
        {/* ─── Header ─── */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">الإشعارات</h3>
              {unreadCount > 0 && (
                <Badge className="text-[10px] h-5 min-w-[20px] px-1.5 rounded-full bg-primary/15 text-primary border-primary/25 border hover:bg-primary/20">
                  {unreadCount}
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/5"
              >
                <CheckCheck className="size-3" />
                تعيين الكل كمقروء
              </button>
            )}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* ─── Notification List ─── */}
        <ScrollArea className="max-h-72">
          <AnimatePresence initial={false}>
            <div className="p-1.5">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3 animate-pulse">
                    <Bell className="size-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">جاري التحميل...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted/50 mb-3">
                    <Bell className="size-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    ستظهر الإشعارات الجديدة هنا تلقائياً
                  </p>
                </div>
              ) : displayNotifications.map((notif, index) => {
                const config = typeConfig[notif.type];
                const NotifIcon = config.icon;

                return (
                  <motion.button
                    key={notif.id}
                    custom={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      group relative flex items-start gap-3 w-full text-right p-2.5 rounded-lg
                      transition-all duration-200 cursor-pointer
                      hover:bg-accent/30
                      ${!notif.read ? 'bg-accent/10' : ''}
                    `}
                  >
                    {/* Type-colored left border */}
                    <div
                      className={`
                        absolute top-2 bottom-2 left-0 w-[3px] rounded-full
                        transition-opacity duration-200
                        ${notif.read ? `opacity-30 ${config.barColor}` : config.barColor}
                      `}
                    />

                    {/* Icon container */}
                    <div
                      className={`
                        flex items-center justify-center size-8 rounded-lg shrink-0
                        transition-transform duration-200 group-hover:scale-110
                        ${config.iconBg}
                      `}
                    >
                      <NotifIcon className={`size-4 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            text-[13px] leading-relaxed truncate
                            ${!notif.read ? 'font-bold text-foreground' : 'font-medium text-foreground/75'}
                          `}
                        >
                          {notif.title}
                        </span>
                        {/* Unread dot indicator */}
                        {!notif.read && (
                          <span className="size-2 rounded-full bg-primary shrink-0 notification-badge-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground/60 mt-0.5 block">
                        {notif.timeAgo}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatePresence>
        </ScrollArea>

        <Separator className="bg-border/50" />

        {/* ─── Footer ─── */}
        <div className="px-3 py-2">
          <button
            onClick={handleViewAll}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors duration-200"
          >
            <span>عرض جميع الإشعارات</span>
            <ArrowLeft className="size-3.5" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
