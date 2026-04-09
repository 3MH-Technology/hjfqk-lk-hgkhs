'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type Page } from '@/store/app-store';

const pageTitles: Record<Page, string> = {
  landing: 'الرئيسية',
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  dashboard: 'لوحة التحكم',
  bots: 'إدارة البوتات',
  'bot-detail': 'تفاصيل البوت',
  files: 'مدير الملفات',
  logs: 'السجلات',
  settings: 'الإعدادات',
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
      {/* Left: User Avatar - appears on the left in RTL */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {avatarLetter}
        </div>
      </div>

      {/* Center: Page Title */}
      <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold text-foreground md:text-lg">
        {pageTitle}
      </h1>

      {/* Right: Hamburger Menu - appears on the right in RTL */}
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
