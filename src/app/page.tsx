'use client';

import { useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useAppStore } from '@/store/app-store';
import Login from '@/components/wolf/auth/login-form';
import Register from '@/components/wolf/auth/register-form';
import { AppLayout } from '@/components/wolf/layout/app-layout';
import Landing from '@/components/wolf/landing';
import { PrivacyPolicy } from '@/components/wolf/legal/privacy';
import { TermsOfService } from '@/components/wolf/legal/terms';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden pulse-dot">
          <img
            src="https:
            alt="استضافة الذئب"
            className="w-10 h-10 rounded-lg object-cover"
          />
        </div>
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

function NotFound() {
  const { setCurrentPage } = useAppStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="text-8xl font-bold gradient-text opacity-30">404</div>
        <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <button
          onClick={() => setCurrentPage('landing')}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { data: session, status } = useSession();
  const { currentPage, setCurrentPage, setUser, isLoading, setLoading } = useAppStore();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (session?.user) {
      setUser({
        id: (session.user as any).id,
        email: session.user.email || '',
        name: session.user.name,
        role: (session.user as any).role || 'user',
        plan: (session.user as any).plan || 'free',
        avatarUrl: (session.user as any).avatarUrl || null,
      });

      
      if (['landing', 'login', 'register'].includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    } else {
      setUser(null);
      
      if (!['landing', 'login', 'register', '404', 'privacy', 'terms'].includes(currentPage)) {
        setCurrentPage('landing');
      }
    }
  }, [session, status, currentPage, setCurrentPage, setUser, setLoading]);

  if (isLoading || status === 'loading') {
    return <LoadingScreen />;
  }

  
  if (currentPage === 'login') {
    return <Login />;
  }

  if (currentPage === 'register') {
    return <Register />;
  }

  
  if (currentPage === 'landing') {
    return <Landing />;
  }

  
  if (currentPage === 'privacy') {
    return <PrivacyPolicy />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService />;
  }

  
  if (currentPage === '404') {
    return <NotFound />;
  }

  
  if (!session?.user) {
    setCurrentPage('landing');
    return null;
  }

  return <AppLayout />;
}

export default function Home() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
