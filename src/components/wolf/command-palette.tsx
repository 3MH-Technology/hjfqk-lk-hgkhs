'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  MonitorDot,
  FolderOpen,
  ScrollText,
  Activity,
  Settings,
  Plus,
  LogOut,
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useAppStore, type Page } from '@/store/app-store';

interface CommandItemData {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentPage, user, setUser, setSidebarOpen } =
    useAppStore();

  
  const navItems = useMemo<CommandItemData[]>(
    () => [
      {
        id: 'dashboard',
        label: 'لوحة التحكم',
        description: 'نظرة عامة على حالة البوتات والإحصائيات',
        icon: <LayoutDashboard className="size-4 text-primary" />,
        action: () => setCurrentPage('dashboard'),
        keywords: ['رئيسية', 'الرئيسية', 'overview', 'home'],
      },
      {
        id: 'bots',
        label: 'إدارة البوتات',
        description: 'إنشاء وإدارة جميع البوتات الخاصة بك',
        icon: <Bot className="size-4 text-primary" />,
        action: () => setCurrentPage('bots'),
        keywords: ['بوت', 'bot', 'bots', 'إدارة'],
      },

      {
        id: 'bot-monitoring',
        label: 'مراقبة الأداء',
        description: 'متابعة أداء واستهلاك موارد البوتات',
        icon: <MonitorDot className="size-4 text-primary" />,
        action: () => setCurrentPage('bot-monitoring'),
        keywords: ['مراقبة', 'monitoring', 'performance', 'أداء'],
      },
      {
        id: 'files',
        label: 'مدير الملفات',
        description: 'إدارة ملفات البوتات والمرفقات',
        icon: <FolderOpen className="size-4 text-primary" />,
        action: () => setCurrentPage('files'),
        keywords: ['ملفات', 'files', 'مدير', 'رفع'],
      },
      {
        id: 'logs',
        label: 'السجلات',
        description: 'عرض سجلات التشغيل والأخطاء',
        icon: <ScrollText className="size-4 text-primary" />,
        action: () => setCurrentPage('logs'),
        keywords: ['سجل', 'logs', 'تشغيل', 'أخطاء'],
      },
      {
        id: 'activity',
        label: 'مركز النشاط',
        description: 'عرض آخر الأنشطة والإشعارات',
        icon: <Activity className="size-4 text-primary" />,
        action: () => setCurrentPage('activity'),
        keywords: ['نشاط', 'activity', 'إشعارات', 'notifications'],
      },
      {
        id: 'settings',
        label: 'الإعدادات',
        description: 'إعدادات الحساب والتفضيلات',
        icon: <Settings className="size-4 text-primary" />,
        action: () => setCurrentPage('settings'),
        keywords: ['إعدادات', 'settings', 'حساب', 'تفضيلات'],
      },
    ],
    [setCurrentPage],
  );

  
  const actionItems = useMemo<CommandItemData[]>(
    () => [
      {
        id: 'create-bot',
        label: 'إنشاء بوت جديد',
        description: 'ابدأ بإنشاء بوت جديد من الصفر',
        icon: <Plus className="size-4 text-primary" />,
        action: () => {
          setCurrentPage('bots');
        },
        keywords: ['جديد', 'create', 'إنشاء', 'new'],
      },
      {
        id: 'logout',
        label: 'تسجيل الخروج',
        description: 'تسجيل الخروج من حسابك',
        icon: <LogOut className="size-4 text-destructive" />,
        action: async () => {
          await signOut({ redirect: false });
          setUser(null);
          setCurrentPage('landing');
          setSidebarOpen(false);
        },
        keywords: ['خروج', 'logout', 'تسجيل'],
      },
    ],
    [setCurrentPage, setUser, setSidebarOpen],
  );

  
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    },
    [commandPaletteOpen, setCommandPaletteOpen],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = useCallback(
    (item: CommandItemData) => {
      item.action();
      setCommandPaletteOpen(false);
    },
    [setCommandPaletteOpen],
  );

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title="لوحة الأوامر"
      description="ابحث وانتقل بسرعة بين الصفحات"
      className="sm:max-w-lg"
    >
      <div className="flex items-center">
        <CommandInput
          placeholder="ابحث عن صفحة أو إجراء..."
          dir="rtl"
          className="text-right"
        />
      </div>
      <CommandList className="max-h-[360px]">
        <CommandEmpty className="py-8">
          <div className="flex flex-col items-center gap-2">
            <Search className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">لم يتم العثور على نتائج</p>
          </div>
        </CommandEmpty>

        {/* Navigation Group */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CommandGroup heading="التنقل">
              {navItems.map((item, index) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.description} ${(item.keywords || []).join(' ')}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors duration-150 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/5"
                  >
                    {item.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Actions Group */}
            <CommandGroup heading="الإجراءات">
              {actionItems.map((item, index) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.description} ${(item.keywords || []).join(' ')}`}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors duration-150 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (navItems.length + index) * 0.03,
                      duration: 0.15,
                    }}
                    className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                      item.id === 'logout'
                        ? 'bg-destructive/5'
                        : 'bg-primary/5'
                    }`}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        item.id === 'logout' ? 'text-destructive' : ''
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </motion.div>
        </AnimatePresence>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-border/50 px-3 py-2 mt-1">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                <ArrowUp className="size-2.5" />
              </kbd>
              <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                <ArrowDown className="size-2.5" />
              </kbd>
              <span className="mr-1">تنقل</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                <CornerDownLeft className="size-2.5" />
              </kbd>
              <span className="mr-1">اختيار</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">
                <X className="size-2.5" />
              </kbd>
              <span className="mr-1">إغلاق</span>
            </span>
          </div>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
