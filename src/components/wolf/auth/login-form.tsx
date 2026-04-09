'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, Eye, EyeOff, LogIn, Github, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/* ─── Left branding panel (shared visual, only shown md+) ─── */
function AuthBrandingPanel({ subtitle }: { subtitle?: string }) {
  return (
    <div className="hidden md:flex md:w-1/2 lg:w-[55%] relative wolf-paw-bg flex-col items-center justify-center p-8 lg:p-12 overflow-hidden">
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            top: `${10 + (i * 7) % 80}%`,
            left: `${5 + (i * 11) % 90}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + (i % 3)}s`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Wolf emoji */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-6xl shadow-lg shadow-primary/10">
            🐺
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full pulse-dot shadow-lg shadow-primary/50" />
        </div>

        {/* Title */}
        <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-3">
          استضافة الذئب
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base lg:text-lg mb-2">
          منصة استضافة احترافية لبوتات تيليجرام
        </p>
        {subtitle && (
          <p className="text-primary/80 text-sm font-medium mt-1">{subtitle}</p>
        )}

        {/* Feature bullets */}
        <div className="mt-8 space-y-4 w-full text-start">
          {[
            { text: 'تشغيل فوري لبوتاتك', desc: 'ابدأ بلا تأخير' },
            { text: 'إدارة ملفات متكاملة', desc: 'محرر أكواد مدمج' },
            { text: 'مراقبة وسجلات مباشرة', desc: 'تتبع أداء البوتات' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">{feature.text}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setCurrentPage } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('حقول مطلوبة', {
        description: 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
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
        toast.error('فشل تسجيل الدخول', {
          description: result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
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
      toast.error('خطأ غير متوقع', {
        description: 'حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    toast.info('سيتم إضافة هذه الميزة قريباً', {
      description: `تسجيل الدخول بـ ${provider} قيد التطوير`,
    });
  };

  return (
    <div className="min-h-screen flex auth-grid-bg">
      {/* Left branding panel */}
      <AuthBrandingPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-8">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm auth-card">
          <CardHeader className="text-center space-y-4">
            {/* Mobile-only branding (hidden on md+) */}
            <div className="flex flex-col items-center gap-3 md:hidden">
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

            {/* Desktop title (hidden on mobile) */}
            <div className="hidden md:block">
              <CardTitle className="text-xl">مرحباً بعودتك</CardTitle>
              <CardDescription className="mt-1">
                سجل دخولك للمتابعة إلى لوحة التحكم
              </CardDescription>
            </div>

            {/* Mobile title */}
            <div className="md:hidden">
              <CardTitle className="text-lg">تسجيل الدخول</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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

              {/* Password */}
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
                {/* Password hint */}
                <p className="text-xs text-muted-foreground">
                  كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </p>
              </div>

              {/* Remember me + Forgot password row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-border"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    تذكرني
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                  onClick={() =>
                    toast.info('قريباً', {
                      description: 'سيتم إضافة هذه الميزة قريباً',
                    })
                  }
                >
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Submit */}
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

            {/* Divider */}
            <div className="relative my-6">
              <Separator className="bg-border/60" />
              <span className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                أو
              </span>
            </div>

            {/* Social login buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-background/50 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                onClick={() => handleSocialClick('GitHub')}
              >
                <Github className="h-4 w-4 ml-2" />
                <span>تسجيل الدخول بـ GitHub</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-background/50 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                onClick={() => handleSocialClick('Telegram')}
              >
                <Send className="h-4 w-4 ml-2" />
                <span>تسجيل الدخول بـ Telegram</span>
              </Button>
            </div>
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
    </div>
  );
}
