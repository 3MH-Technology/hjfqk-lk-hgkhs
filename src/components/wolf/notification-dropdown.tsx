'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Upload,
  RotateCcw,
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
  icon: typeof Bell;
  title: string;
  timeAgo: string;
  read: boolean;
}

/* ─── Type Config ─── */

const typeConfig: Record<
  NotificationType,
  {
    iconBg: string;
    iconColor: string;
    barColor: string;
  }
> = {
  success: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    barColor: 'bg-emerald-400',
  },
  error: {
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    barColor: 'bg-red-400',
  },
  warning: {
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-400',
  },
  info: {
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    barColor: 'bg-sky-400',
  },
};

/* ─── Mock Data (5 recent items) ─── */

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-001',
    type: 'success',
    icon: CheckCircle2,
    title: 'تم تشغيل البوت بنجاح',
    timeAgo: 'منذ 3 دقائق',
    read: false,
  },
  {
    id: 'notif-002',
    type: 'error',
    icon: XCircle,
    title: 'تم رصد خطأ في البوت',
    timeAgo: 'منذ 12 دقيقة',
    read: false,
  },
  {
    id: 'notif-003',
    type: 'warning',
    icon: AlertTriangle,
    title: 'استخدام عالي للذاكرة',
    timeAgo: 'منذ 25 دقيقة',
    read: false,
  },
  {
    id: 'notif-004',
    type: 'info',
    icon: Upload,
    title: 'تم رفع ملف جديد',
    timeAgo: 'منذ ساعة',
    read: false,
  },
  {
    id: 'notif-005',
    type: 'success',
    icon: RotateCcw,
    title: 'تم إعادة تشغيل البوت تلقائياً',
    timeAgo: 'منذ ساعتين',
    read: false,
  },
];

/* ─── Animation Variants ─── */

const listItemVariants = {
  hidden: { opacity: 0, x: 12, height: 0 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: {
      delay: i * 0.04,
      duration: 0.25,
      ease: 'easeOut' as const,
    },
  }),
  exit: {
    opacity: 0,
    x: -12,
    height: 0,
    transition: { duration: 0.15 },
  },
};

/* ─── Main Component ─── */

export function NotificationDropdown() {
  const { unreadNotifications, setUnreadNotifications, setCurrentPage } =
    useAppStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotifications(0);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const newUnread = updated.filter((n) => !n.read).length;
      setUnreadNotifications(newUnread);
      return updated;
    });
  };

  const handleViewAll = () => {
    setOpen(false);
    setCurrentPage('activity');
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
              {notifications.map((notif, index) => {
                const config = typeConfig[notif.type];
                const NotifIcon = notif.icon;

                return (
                  <motion.button
                    key={notif.id}
                    custom={index}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                    }}
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
