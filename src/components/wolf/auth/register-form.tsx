'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
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

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setCurrentPage } = useAppStore();

  const validateForm = (): string | null => {
    if (!name.trim()) return 'يرجى إدخال الاسم';
    if (!email.trim()) return 'يرجى إدخال البريد الإلكتروني';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'البريد الإلكتروني غير صالح';
    }
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password !== confirmPassword) return 'كلمتا المرور غير متطابقتين';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast({
        title: 'تنبيه',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'فشل التسجيل',
          description: data.error || 'حدث خطأ أثناء التسجيل',
          variant: 'destructive',
        });
        return;
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'تم التسجيل بنجاح',
          description: 'يرجى تسجيل الدخول باستخدام بياناتك',
        });
        setCurrentPage('login');
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
        description: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى',
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
          <CardTitle className="text-lg">إنشاء حساب جديد</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-name">الاسم</Label>
              <Input
                id="register-name"
                type="text"
                placeholder="اسم المستخدم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 h-11"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">البريد الإلكتروني</Label>
              <Input
                id="register-email"
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
              <Label htmlFor="register-password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-background/50 h-11 pe-11"
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">تأكيد كلمة المرور</Label>
              <Input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="bg-background/50 h-11"
                autoComplete="new-password"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={
                isLoading ||
                !name.trim() ||
                !email.trim() ||
                !password ||
                !confirmPassword
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ إنشاء الحساب...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء حساب</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            لديك حساب؟{' '}
            <button
              type="button"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              onClick={() => setCurrentPage('login')}
            >
              سجل دخول
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
