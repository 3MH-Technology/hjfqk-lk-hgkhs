'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, LogIn, Send } from 'lucide-react';
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

/* ─── Framer Motion Variants ─── */
const formVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 } as const,
  visible: { opacity: 1, y: 0, scale: 1 } as const,
} as const;

const brandingVariants = {
  hidden: { opacity: 0, x: 20 } as const,
  visible: { opacity: 1, x: 0 } as const,
} as const;

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 } as const,
  visible: { opacity: 1, y: 0 } as const,
} as const;

/* ─── Wolf Head SVG Component ─── */
function WolfLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="wolf-svg-glow"
    >
      {/* Wolf head silhouette */}
      <path
        d="M50 8L38 28L20 22L28 42L15 58L30 55L25 75L40 68L50 90L60 68L75 75L70 55L85 58L72 42L80 22L62 28L50 8Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.9"
      />
      {/* Left eye */}
      <circle cx="38" cy="45" r="4" fill="oklch(0.98 0.005 75)" />
      <circle cx="38" cy="45" r="2" fill="oklch(0.15 0.02 270)" />
      {/* Right eye */}
      <circle cx="62" cy="45" r="4" fill="oklch(0.98 0.005 75)" />
      <circle cx="62" cy="45" r="2" fill="oklch(0.15 0.02 270)" />
      {/* Nose */}
      <ellipse cx="50" cy="58" rx="4" ry="3" fill="oklch(0.15 0.02 270)" />
      {/* Inner ear details */}
      <path
        d="M38 28L32 20L28 30Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.5"
      />
      <path
        d="M62 28L68 20L72 30Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.5"
      />
    </svg>
  );
}

/* ─── Wolf Silhouette Particle ─── */
function WolfSilhouetteParticle({ size = 16, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 15L40 30L25 25L32 42L20 55L32 52L28 70L40 64L50 82L60 64L72 70L68 52L80 55L68 42L75 25L60 30L50 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Left branding panel (shared visual, only shown md+) ─── */
function AuthBrandingPanel({ subtitle }: { subtitle?: string }) {
  return (
    <motion.div
      className="hidden md:flex md:w-1/2 lg:w-[55%] relative wolf-paw-bg flex-col items-center justify-center p-8 lg:p-12 overflow-hidden"
      variants={brandingVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
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
        {/* Wolf SVG Logo */}
        <div className="relative mb-6 wolf-logo-container">
          <div className="wolf-logo-glow" />
          <div className="w-28 h-28 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <WolfLogo size={56} />
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
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-medium text-sm">{feature.text}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
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

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user) {
        setUser({
          id: (session.user as { id?: string }).id,
          email: session.user.email || '',
          name: session.user.name,
          role: (session.user as { role?: string }).role || 'user',
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
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-8 relative auth-gradient-mesh">
        {/* Wolf silhouette floating particles */}
        <WolfSilhouetteParticle size={20} className="auth-wolf-particle auth-wolf-particle-1" style={{ top: '12%', right: '15%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={14} className="auth-wolf-particle auth-wolf-particle-2" style={{ top: '35%', right: '8%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={18} className="auth-wolf-particle auth-wolf-particle-3" style={{ top: '65%', right: '18%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={12} className="auth-wolf-particle auth-wolf-particle-4" style={{ top: '80%', right: '10%' } as React.CSSProperties} />
        <WolfSilhouetteParticle size={16} className="auth-wolf-particle auth-wolf-particle-5" style={{ top: '50%', right: '25%' } as React.CSSProperties} />

        <motion.div
          className="w-full max-w-md relative z-10"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="w-full auth-glass-card auth-card">
            <CardHeader className="text-center space-y-4">
              {/* Mobile-only branding (hidden on md+) */}
              <div className="flex flex-col items-center gap-3 md:hidden">
                <div className="relative wolf-logo-container">
                  <div className="wolf-logo-glow" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <WolfLogo size={32} />
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
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Email */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
                  <div className="auth-input-wrapper">
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
                </motion.div>

                {/* Password */}
                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <div className="auth-input-wrapper relative">
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
                  <p className="text-xs text-muted-foreground">
                    كلمة المرور يجب أن تكون 6 أحرف على الأقل
                  </p>
                </motion.div>

                {/* Remember me + Forgot password row */}
                <motion.div className="flex items-center justify-between" variants={itemVariants}>
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
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
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
                </motion.div>
              </motion.form>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-border/60" />
                <span className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  أو تابع باستخدام
                </span>
              </div>

              {/* Social login buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-background/50 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={() => handleSocialClick('GitHub')}
                >
                  <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 bg-background/50 border-border/60 hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/5 transition-all"
                  onClick={() => handleSocialClick('Telegram')}
                >
                  <Send className="h-4 w-4 ml-2" />
                  <span>Telegram</span>
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
        </motion.div>
      </div>
    </div>
  );
}
