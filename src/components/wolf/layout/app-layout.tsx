'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { CommandPalette } from '../command-palette';
import { useAppStore } from '@/store/app-store';

// Loading skeleton for lazy-loaded pages
function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Content skeleton */}
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// Loading skeleton for lazy-loaded pages
const loadingFallback = <PageSkeleton />;

// Lazy-loaded page components with loading fallback
const Dashboard = dynamic(
  () => import('@/components/wolf/dashboard/dashboard').then((m) => m.Dashboard),
  { loading: () => loadingFallback }
);

const BotList = dynamic(
  () =>
    import('@/components/wolf/bots/bot-list').then((m) => m.BotList),
  { loading: () => loadingFallback }
);

const BotDetail = dynamic(
  () =>
    import('@/components/wolf/bots/bot-detail').then((m) => m.BotDetail),
  { loading: () => loadingFallback }
);

const BotConsole = dynamic(
  () =>
    import('@/components/wolf/bots/bot-console').then((m) => m.BotConsole),
  { loading: () => loadingFallback }
);

const BotMonitoring = dynamic(
  () =>
    import('@/components/wolf/bots/bot-monitoring'),
  { loading: () => loadingFallback }
);

const FileManager = dynamic(
  () => import('@/components/wolf/files/file-manager'),
  { loading: () => loadingFallback }
);

const LogViewer = dynamic(
  () => import('@/components/wolf/logs/log-viewer'),
  { loading: () => loadingFallback }
);

const RealtimeLogs = dynamic(
  () => import('@/components/wolf/logs/realtime-logs').then((m) => m.RealtimeLogs),
  { loading: () => loadingFallback }
);

const ActivityCenter = dynamic(
  () =>
    import('@/components/wolf/notifications/activity-center'),
  { loading: () => loadingFallback }
);

const AccountSettings = dynamic(
  () => import('@/components/wolf/settings/account-settings'),
  { loading: () => loadingFallback }
);

const AdminPanel = dynamic(
  () => import('@/components/wolf/admin/admin-panel'),
  { loading: () => loadingFallback }
);

const UserManagement = dynamic(
  () => import('@/components/wolf/admin/user-management'),
  { loading: () => loadingFallback }
);

const AdminBots = dynamic(
  () => import('@/components/wolf/admin/admin-bots'),
  { loading: () => loadingFallback }
);

const BotAnalytics = dynamic(
  () => import('@/components/wolf/bots/bot-analytics').then((m) => m.BotAnalytics),
  { loading: () => loadingFallback }
);

const DeploymentHistory = dynamic(
  () => import('@/components/wolf/bots/deployment-history').then((m) => m.DeploymentHistory),
  { loading: () => loadingFallback }
);

const ApiKeysPage = dynamic(
  () => import('@/components/wolf/settings/api-keys'),
  { loading: () => loadingFallback }
);

const WebhooksPage = dynamic(
  () => import('@/components/wolf/settings/webhooks'),
  { loading: () => loadingFallback }
);

const TeamManagementPage = dynamic(
  () => import('@/components/wolf/settings/team-management'),
  { loading: () => loadingFallback }
);

const HelpCenter = dynamic(
  () => import('@/components/wolf/help-center'),
  { loading: () => loadingFallback }
);

const DevAdmin = dynamic(
  () => import('@/components/wolf/admin/dev-admin'),
  { loading: () => loadingFallback }
);

const PrivacyPolicy = dynamic(
  () => import('@/components/wolf/legal/privacy').then((m) => ({ default: m.PrivacyPolicy })),
  { loading: () => loadingFallback }
);

const TermsOfService = dynamic(
  () => import('@/components/wolf/legal/terms').then((m) => ({ default: m.TermsOfService })),
  { loading: () => loadingFallback }
);

// Page renderer based on currentPage state
function PageContent() {
  const { currentPage } = useAppStore();

  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;
    case 'bots':
      return <BotList />;
    case 'bot-detail':
      return <BotDetail />;
    case 'bot-console':
      return <BotConsole />;
    case 'bot-monitoring':
      return <BotMonitoring />;
    case 'files':
      return <FileManager />;
    case 'logs':
      return <LogViewer />;
    case 'realtime-logs':
      return <RealtimeLogs />;
    case 'activity':
      return <ActivityCenter />;
    case 'settings':
      return <AccountSettings />;
    case 'help':
      return <HelpCenter />;
    case 'admin':
      return <AdminPanel />;
    case 'admin-users':
      return <UserManagement />;
    case 'admin-bots':
      return <AdminBots />;
    case 'bot-analytics':
      return <BotAnalytics />;
    case 'deployment-history':
      return <DeploymentHistory />;
    case 'api-keys':
      return <ApiKeysPage />;
    case 'webhooks':
      return <WebhooksPage />;
    case 'team':
      return <TeamManagementPage />;
    case 'dev-admin':
      return <DevAdmin />;
    case 'privacy':
      return <PrivacyPolicy />;
    case 'terms':
      return <TermsOfService />;
    default:
      return <Dashboard />;
  }
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - fixed on right for RTL */}
      <Sidebar />

      {/* Header - fixed at top, full width */}
      <Header />

      {/* Command Palette */}
      <CommandPalette />

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen md:mr-64">
        <div className="p-4 md:p-6 lg:p-8">
          <PageContent />
        </div>
      </main>
    </div>
  );
}
