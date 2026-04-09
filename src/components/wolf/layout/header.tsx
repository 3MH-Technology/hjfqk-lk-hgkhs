'use client';

import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore, type Page } from '@/store/app-store';

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
  admin: 'لوحة المدير',
  'admin-users': 'إدارة المستخدمين',
  'admin-bots': 'إدارة البوتات العامة',
  '404': 'الصفحة غير موجودة',
};

export function Header() {
  const { currentPage, toggleSidebar, user, setCurrentPage, unreadNotifications } = useAppStore();

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
        {/* Notification Bell - visible when authenticated */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage('activity')}
            className="relative text-muted-foreground hover:text-foreground transition-colors"
            aria-label="الإشعارات"
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white notification-badge-pulse min-w-[18px] h-[18px] px-1">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Center: Page Title */}
      <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold text-foreground md:text-lg">
        {pageTitle}
      </h1>

      {/* Right: Hamburger Menu */}
      <div className="flex items-center gap-2">
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
