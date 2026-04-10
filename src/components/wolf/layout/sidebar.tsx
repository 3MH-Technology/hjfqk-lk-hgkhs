'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  FolderOpen,
  ScrollText,
  Settings,
  Shield,
  LogOut,
  X,
  Activity,
  Package,
  MonitorDot,
  LifeBuoy,
  Cpu,
  MemoryStick,
  ChevronDown,
  Clock,
  BarChart3,
  History,
  Key,
  Webhook as WebhookIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useAppStore, type Page } from '@/store/app-store';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: number;
  separator?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'لوحة التحكم',
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    id: 'bots',
    label: 'إدارة البوتات',
    icon: <Bot className="size-5" />,
  },
  {
    id: 'bot-templates',
    label: 'قوالب البوتات',
    icon: <Package className="size-5" />,
  },
  {
    id: 'bot-monitoring',
    label: 'مراقبة الأداء',
    icon: <MonitorDot className="size-5" />,
  },
  {
    id: 'bot-analytics',
    label: 'تحليلات البوتات',
    icon: <BarChart3 className="size-5" />,
  },
  {
    id: 'deployment-history',
    label: 'سجل النشر',
    icon: <History className="size-5" />,
  },
  {
    id: 'files',
    label: 'مدير الملفات',
    icon: <FolderOpen className="size-5" />,
  },
  {
    id: 'logs',
    label: 'السجلات',
    icon: <ScrollText className="size-5" />,
  },
  {
    id: 'api-keys',
    label: 'مفاتيح API',
    icon: <Key className="size-5" />,
    separator: true,
  },
  {
    id: 'webhooks',
    label: 'وخدمات الويب',
    icon: <WebhookIcon className="size-5" />,
  },
  {
    id: 'activity',
    label: 'النشاط',
    icon: <Activity className="size-5" />,
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: <Settings className="size-5" />,
  },
  {
    id: 'help',
    label: 'مركز المساعدة',
    icon: <LifeBuoy className="size-5" />,
    separator: true,
  },
  {
    id: 'admin',
    label: 'لوحة المدير',
    icon: <Shield className="size-5" />,
    adminOnly: true,
  },
];

// Sidebar overlay backdrop for mobile
function MobileBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
      onClick={onClick}
    />
  );
}

interface SystemMetrics {
  cpu: number;
  ram: number;
  activeBots: number;
  totalBots: number;
  uptime: number;
}

interface ActiveBot {
  id: string;
  name: string;
  status: string;
}

// System metrics - loaded from API
function useSystemMetrics() {
  const [mounted, setMounted] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    ram: 0,
    activeBots: 0,
    totalBots: 0,
    uptime: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    fetch('/api/stats', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setMetrics({
            cpu: data.cpu ?? 0,
            ram: data.ram ?? 0,
            activeBots: data.activeBots ?? 0,
            totalBots: data.totalBots ?? 0,
            uptime: data.uptime ?? 0,
          });
        }
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  return { metrics, mounted };
}

// Active bots - loaded from API
function useActiveBots() {
  const [bots, setBots] = useState<ActiveBot[]>([]);

  useEffect(() => {
    fetch('/api/bots', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const running = data
            .filter((b: { status: string }) => b.status === 'running')
            .slice(0, 5)
            .map((b: { id: string; name: string; status: string }) => ({
              id: b.id,
              name: b.name,
              status: b.status,
            }));
          setBots(running);
        }
      })
      .catch(() => {});
  }, []);

  return { bots };
}

function SidebarContent({
  onNavigate,
  isMobile,
}: {
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const { currentPage, setCurrentPage, user, setSidebarOpen, setUser, unreadNotifications, setSelectedBotId } =
    useAppStore();
  const [systemOpen, setSystemOpen] = useState(false);
  const { metrics, mounted } = useSystemMetrics();
  const { bots } = useActiveBots();

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const handleBotClick = (botId: string) => {
    setSelectedBotId(botId);
    setCurrentPage('bot-detail');
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUser(null);
    setCurrentPage('landing');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const filteredNavItems = navItems.map((item) => ({
    ...item,
    badge: item.id === 'activity' ? unreadNotifications : undefined,
  })).filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="https://f.top4top.io/p_37210bgwm1.jpg" alt="استضافة الذئب" className="w-7 h-7 rounded-full object-cover" />
          <span className="text-lg font-bold gradient-text">
            استضافة الذئب
          </span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" role="navigation">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = currentPage === item.id;

            const button = (
              <button
                onClick={() => handleNavigate(item.id)}
                className={`
                  group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-primary"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <span className={isActive ? 'text-primary' : ''}>
                  {item.icon}
                </span>
                <span className="flex-1 text-right">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className={`h-5 min-w-5 px-1.5 text-[10px] font-bold flex items-center justify-center ${
                      !isActive ? 'notification-badge-pulse' : ''
                    }`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </button>
            );

            if (isMobile) {
              return (
                <li key={item.id}>
                  {item.separator && <Separator className="bg-sidebar-border mb-2" />}
                  {button}
                </li>
              );
            }

            return (
              <li key={item.id}>
                {item.separator && <Separator className="bg-sidebar-border mb-2" />}
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="left" sideOffset={12} className="sidebar-tooltip">
                    <p>{item.label}</p>
                    {item.badge && item.badge > 0 && (
                      <p className="text-xs text-destructive mt-1">
                        {item.badge} إشعار جديد
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* System Status Section (Collapsible) */}
      <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
        <div className="px-4 pt-3 pb-1">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between text-[11px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors">
              <span className="flex items-center gap-1.5">
                <Activity className="size-3" />
                حالة النظام
              </span>
              <motion.div
                animate={{ rotate: systemOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="size-3" />
              </motion.div>
            </button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-3">
            {/* 2x2 Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* CPU */}
              <div className="rounded-md bg-sidebar-accent/50 px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Cpu className="size-3 text-emerald-400" />
                  <span className="text-[10px] text-sidebar-foreground/50">CPU</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                >
                  <div className="h-1.5 w-full rounded-full bg-sidebar-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: mounted ? `${metrics.cpu}%` : '0%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </motion.div>
                <span className="text-[10px] font-medium text-sidebar-foreground/60 mt-1 block">{mounted ? `${metrics.cpu}%` : '--'}%</span>
              </div>

              {/* RAM */}
              <div className="rounded-md bg-sidebar-accent/50 px-2.5 py-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MemoryStick className="size-3 text-blue-400" />
                  <span className="text-[10px] text-sidebar-foreground/50">RAM</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                >
                  <div className="h-1.5 w-full rounded-full bg-sidebar-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-blue-400"
                      initial={{ width: 0 }}
                      animate={{ width: mounted ? `${metrics.ram}%` : '0%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                    />
                  </div>
                </motion.div>
                <span className="text-[10px] font-medium text-sidebar-foreground/60 mt-1 block">{mounted ? `${metrics.ram}%` : '--'}%</span>
              </div>

              {/* Active Bots */}
              <div className="rounded-md bg-sidebar-accent/50 px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <Bot className="size-3 text-primary" />
                  <span className="text-[10px] text-sidebar-foreground/50">البوتات النشطة</span>
                </div>
                <span className="text-[13px] font-bold text-sidebar-foreground/80 mt-0.5 block">
                  {mounted ? `${metrics.activeBots}/${metrics.totalBots}` : '--'}
                </span>
              </div>

              {/* Uptime */}
              <div className="rounded-md bg-sidebar-accent/50 px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-emerald-400" />
                  <span className="text-[10px] text-sidebar-foreground/50">وقت التشغيل</span>
                </div>
                <span className="text-[13px] font-bold text-emerald-400 mt-0.5 block">
                  {mounted ? `${metrics.uptime}%` : '--'}
                </span>
              </div>
            </div>

            {/* Active Bots Quick List */}
            {bots.length > 0 && (
              <div className="mt-2.5 space-y-0.5">
                <span className="text-[10px] text-sidebar-foreground/40 px-1">البوتات يعمل حالياً</span>
                {bots.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => handleBotClick(bot.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground/80 transition-colors"
                  >
                    <span className="relative flex size-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="flex-1 truncate text-right">{bot.name}</span>
                    <span className="text-[9px] text-emerald-400">يعمل</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator className="bg-sidebar-border" />

      {/* Enhanced User Profile Card */}
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          {/* Avatar with animated gradient border and online indicator */}
          <div className="relative shrink-0">
            <div className="relative rounded-full p-[2px] bg-gradient-to-tr from-primary/40 via-blue-500/40 to-primary/40 transition-all duration-500 hover:from-primary hover:via-blue-500 hover:to-primary hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              <div className="flex size-10 items-center justify-center rounded-full bg-sidebar text-sm font-bold text-primary">
                {user?.email?.charAt(0)?.toUpperCase() ||
                  user?.name?.charAt(0)?.toUpperCase() ||
                  'م'}
              </div>
            </div>
            {/* Online status pulsing dot */}
            <span className="absolute -bottom-0.5 -left-0.5 flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full border-2 border-sidebar bg-emerald-500" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-sidebar-foreground">
                {user?.name || 'مستخدم'}
              </p>
              <Badge
                variant="outline"
                className={`text-[8px] px-1 py-0 shrink-0 ${
                  user?.role === 'admin'
                    ? 'border-primary/40 text-primary bg-primary/10'
                    : 'border-sidebar-foreground/20 text-sidebar-foreground/40 bg-sidebar-foreground/5'
                }`}
              >
                {user?.role === 'admin' ? 'مدير' : 'مستخدم'}
              </Badge>
            </div>
            <p className="truncate text-[11px] text-sidebar-foreground/40 mt-0.5">
              {user?.email || ''}
            </p>
            <button
              onClick={() => handleNavigate('settings')}
              className="text-[10px] text-primary/60 hover:text-primary transition-colors mt-0.5 block"
            >
              تعديل الملف الشخصي
            </button>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-sidebar-border text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          <span className="text-sm">تسجيل الخروج</span>
        </Button>
      </div>

      {/* Footer */}
      <Separator className="bg-sidebar-border" />
      <div className="px-4 py-2 text-center">
        <p className="text-[9px] text-sidebar-foreground/25">
          استضافة الذئب v0.2
        </p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <MobileBackdrop onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-screen w-72 md:hidden"
            >
              <SidebarContent
                onNavigate={() => setSidebarOpen(false)}
                isMobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Sidebar */}
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-64 md:block">
        <SidebarContent />
      </aside>
    </>
  );
}
