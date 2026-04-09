'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setCurrentPage } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: 'حقول مطلوبة',
        description: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'فشل تسجيل الدخول',
          description: result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          variant: 'destructive',
        });
        return;
      }

      // Fetch session to get user data
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        setUser({
          id: (session.user as any).id,
          email: session.user.email || '',
          name: session.user.name,
          role: (session.user as any).role || 'user',
        });
        setCurrentPage('dashboard');
      }
    } catch {
      toast({
        title: 'خطأ غير متوقع',
        description: 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          {/* Wolf Branding */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
                🐺
              </div>
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full pulse-dot" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                استضافة الذئب
              </h1>
              <CardDescription className="mt-1 text-sm">
                منصة استضافة احترافية لبوتات تيليجرام
              </CardDescription>
            </div>
          </div>
          <CardTitle className="text-lg">تسجيل الدخول</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">البريد الإلكتروني</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 h-11"
                autoComplete="email"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background/50 h-11 pe-11"
                  autoComplete="current-password"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={() =>
                  toast({
                    title: 'قريباً',
                    description: 'سيتم إضافة هذه الميزة قريباً',
                  })
                }
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              onClick={() => setCurrentPage('register')}
            >
              سجل الآن
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
