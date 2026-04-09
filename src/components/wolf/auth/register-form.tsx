'use client';

import { useState, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import {
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  X,
  CheckCircle2,
} from 'lucide-react';
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

/* ─── Password strength logic ─── */
function usePasswordStrength(password: string) {
  return useMemo(() => {
    const checks = {
      minLength: password.length >= 6,
      hasLetter: /[a-zA-Z\u0600-\u06FF]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    const metCount = Object.values(checks).filter(Boolean).length;

    let strength: 'none' | 'weak' | 'medium' | 'strong' = 'none';
    let percent = 0;

    if (password.length === 0) {
      strength = 'none';
      percent = 0;
    } else if (!checks.minLength) {
      strength = 'weak';
      percent = 25;
    } else if (checks.minLength && checks.hasLetter && !checks.hasNumber && !checks.hasSpecial) {
      strength = 'medium';
      percent = 50;
    } else if (checks.minLength && checks.hasLetter && checks.hasNumber && !checks.hasSpecial) {
      strength = 'medium';
      percent = 70;
    } else if (metCount >= 4) {
      strength = 'strong';
      percent = 100;
    } else {
      strength = 'medium';
      percent = 50;
    }

    const labels: Record<string, string> = {
      none: '',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
    };

    return {
      checks,
      strength,
      percent,
      label: labels[strength],
    };
  }, [password]);
}

/* ─── Requirement item ─── */
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
      )}
      <span className={met ? 'text-green-400/90' : 'text-muted-foreground/60'}>
        {text}
      </span>
    </div>
  );
}

/* ─── Left branding panel ─── */
function AuthBrandingPanel() {
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
        <p className="text-primary/80 text-sm font-medium mt-1">
          انضم إلى مجتمع المطورين
        </p>

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

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setCurrentPage } = useAppStore();

  const { checks, strength, percent, label } = usePasswordStrength(password);

  const validateForm = (): string | null => {
    if (!name.trim()) return 'يرجى إدخال الاسم';
    if (!email.trim()) return 'يرجى إدخال البريد الإلكتروني';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'البريد الإلكتروني غير صالح';
    }
    if (password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password !== confirmPassword) return 'كلمتا المرور غير متطابقتين';
    if (!agreedToTerms) return 'يجب الموافقة على شروط الاستخدام';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      toast.error('تنبيه', { description: error });
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
        toast.error('فشل التسجيل', {
          description: data.error || 'حدث خطأ أثناء التسجيل',
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
        toast.success('تم التسجيل بنجاح', {
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
      toast.error('خطأ غير متوقع', {
        description: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColorClass =
    strength === 'strong'
      ? 'strength-strong'
      : strength === 'medium'
        ? 'strength-medium'
        : strength === 'weak'
          ? 'strength-weak'
          : 'bg-border';

  const strengthLabelColor =
    strength === 'strong'
      ? 'text-green-400'
      : strength === 'medium'
        ? 'text-yellow-400'
        : strength === 'weak'
          ? 'text-red-400'
          : 'text-muted-foreground';

  return (
    <div className="min-h-screen flex auth-grid-bg">
      {/* Left branding panel */}
      <AuthBrandingPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-8">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm auth-card">
          <CardHeader className="text-center space-y-4">
            {/* Mobile-only branding */}
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

            {/* Desktop title */}
            <div className="hidden md:block">
              <CardTitle className="text-xl">إنشاء حساب جديد</CardTitle>
              <CardDescription className="mt-1">
                انضم إلى منصة استضافة الذئب
              </CardDescription>
            </div>

            {/* Mobile title */}
            <div className="md:hidden">
              <CardTitle className="text-lg">إنشاء حساب جديد</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
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

              {/* Email */}
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

              {/* Password */}
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

                {/* Password strength bar */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strengthColorClass}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${strengthLabelColor}`}>
                        {label}
                      </span>
                    </div>

                    {/* Requirements checklist */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <RequirementItem met={checks.minLength} text="6 أحرف على الأقل" />
                      <RequirementItem met={checks.hasLetter} text="يحتوي على أحرف" />
                      <RequirementItem met={checks.hasNumber} text="يحتوي على أرقام" />
                      <RequirementItem met={checks.hasSpecial} text="يحتوي على رموز خاصة" />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
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
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-400">كلمتا المرور غير متطابقتين</p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="text-xs text-green-400">كلمتا المرور متطابقتان ✓</p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="agree-terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="border-border mt-0.5"
                />
                <Label
                  htmlFor="agree-terms"
                  className="text-sm text-muted-foreground cursor-pointer select-none leading-relaxed"
                >
                  أوافق على{' '}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('سيتم إضافة الشروط قريباً', {
                        description: 'صفحة شروط الاستخدام وسياسة الخصوصية قيد التطوير',
                      });
                    }}
                  >
                    شروط الاستخدام
                  </button>
                  {' '}و{' '}
                  <button
                    type="button"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('سيتم إضافة الشروط قريباً', {
                        description: 'صفحة شروط الاستخدام وسياسة الخصوصية قيد التطوير',
                      });
                    }}
                  >
                    سياسة الخصوصية
                  </button>
                </Label>
              </div>

              {/* Submit */}
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

            {/* Divider */}
            <div className="relative my-6">
              <Separator className="bg-border/60" />
              <span className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                أو
              </span>
            </div>

            {/* Social login hint */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                يمكنك أيضاً التسجيل باستخدام حسابك على GitHub أو Telegram
              </p>
            </div>
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
    </div>
  );
}
