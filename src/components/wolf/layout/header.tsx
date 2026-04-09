'use client';

import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type Page } from '@/store/app-store';
import { NotificationDropdown } from '../notification-dropdown';

const pageTitles: Record<Page, string> = {
  landing: 'الرئيسية',
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  dashboard: 'لوحة التحكم',
  bots: 'إدارة البوتات',
  'bot-detail': 'تفاصيل البوت',
  'bot-templates': 'قوالب البوتات',
  'bot-monitoring': 'مراقبة الأداء',
  files: 'مدير الملفات',
  logs: 'السجلات',
  activity: 'مركز النشاط',
  settings: 'الإعدادات',
  help: 'مركز المساعدة',
  admin: 'لوحة المدير',
  'admin-users': 'إدارة المستخدمين',
  'admin-bots': 'إدارة البوتات العامة',
  '404': 'الصفحة غير موجودة',
};

export function Header() {
  const { currentPage, toggleSidebar, user } = useAppStore();

  const pageTitle = pageTitles[currentPage] || 'لوحة التحكم';
  const avatarLetter =
    user?.name?.charAt(0) ||
    user?.email?.charAt(0) ||
    'م';

  return (
    <header className="glass fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between px-4 md:pr-[17rem]">
      {/* Left: User Avatar */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {avatarLetter}
        </div>
        {/* Notification Dropdown - visible when authenticated */}
        {user && <NotificationDropdown />}
      </div>

      {/* Center: Page Title */}
      <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold text-foreground md:text-lg">
        {pageTitle}
      </h1>

      {/* Right: Command Palette Hint + Hamburger Menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
          className="hidden items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground md:flex"
          aria-label="افتح لوحة الأوامر"
        >
          <Search className="size-3" />
          <span>بحث...</span>
          <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] leading-none">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => useAppStore.getState().setCommandPaletteOpen(true)}
          className="text-muted-foreground hover:text-foreground md:hidden"
          aria-label="البحث"
        >
          <Search className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground md:hidden"
          aria-label="القائمة"
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </header>
  );
}
