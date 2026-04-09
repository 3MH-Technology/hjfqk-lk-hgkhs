'use client';

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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useAppStore, type Page } from '@/store/app-store';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
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
    id: 'settings',
    label: 'الإعدادات',
    icon: <Settings className="size-5" />,
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

function SidebarContent({
  onNavigate,
  isMobile,
}: {
  onNavigate?: () => void;
  isMobile?: boolean;
}) {
  const { currentPage, setCurrentPage, user, setSidebarOpen, setUser } =
    useAppStore();

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
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

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐺</span>
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
                <span>{item.label}</span>
              </button>
            );

            if (isMobile) {
              return (
                <li key={item.id}>{button}</li>
              );
            }

            return (
              <li key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="left" sideOffset={12}>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Info & Logout */}
      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            {user?.email?.charAt(0)?.toUpperCase() ||
              user?.name?.charAt(0)?.toUpperCase() ||
              'م'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name || 'مستخدم'}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {user?.email || ''}
            </p>
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
