'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, LogIn, Send, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* ─── Framer Motion Variants ─── */
const formVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const brandingVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const inputGlowVariants: Variants = {
  idle: { boxShadow: '0 0 0 0px transparent' },
  focused: {
    boxShadow: '0 0 0 2px oklch(0.60 0.20 250 / 0.15), 0 0 20px -4px oklch(0.60 0.20 250 / 0.2)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

const eyeSwapVariants: Variants = {
  show: { rotate: 0, scale: 1, opacity: 1 },
  hide: { rotate: -90, scale: 0.5, opacity: 0 },
};

const dialogOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const dialogContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ─── Wolf Logo Component ─── */
function WolfLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src="https://f.top4top.io/p_37210bgwm1.jpg"
      alt="استضافة الذئب"
      style={{ width: size, height: size }}
      className="rounded-full object-cover wolf-svg-glow"
    />
  );
}

/* ─── Wolf Silhouette Particle ─── */
function WolfSilhouetteParticle({ size = 16, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src="https://f.top4top.io/p_37210bgwm1.jpg"
      alt=""
      style={{ width: size, height: size, ...style }}
      className={`rounded-full object-cover ${className}`}
    />
  );
}

/* ─── Enhanced Input Wrapper with Focus Glow ─── */
function GlowInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  dir,
  autoComplete,
  children,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  dir?: string;
  autoComplete: string;
  children?: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <motion.div
        variants={inputGlowVariants}
        animate={isFocused ? 'focused' : 'idle'}
        className="auth-input-wrapper relative rounded-lg"
      >
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`bg-background/50 h-11 ${children ? 'pe-11' : ''} transition-all duration-200 focus:ring-0 focus:ring-offset-0`}
          autoComplete={autoComplete}
          dir={dir}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {children && (
          <div className="absolute left-1 top-1/2 -translate-y-1/2">
            {children}
          </div>
        )}
      </motion.div>
      {/* Gradient underline effect */}
      <motion.div
        className="h-0.5 rounded-full bg-gradient-to-l from-transparent via-primary/60 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: isFocused ? 1 : 0,
          opacity: isFocused ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </motion.div>
  );
}

/* ─── Forgot Password Dialog ─── */
function ForgotPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [resetEmail, setResetEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleReset = async () => {
    if (!resetEmail.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    setIsSending(true);
    // Simulate sending
    setTimeout(() => {
      toast.success('تم إرسال رابط إعادة التعيين', {
        description: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور',
      });
      setIsSending(false);
      setResetEmail('');
      onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="auth-glass-card border-border/40 max-w-sm">
        <DialogHeader className="text-center sm:text-center">
          <motion.div
            className="mx-auto mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
          </motion.div>
          <DialogTitle className="text-lg">نسيت كلمة المرور؟</DialogTitle>
          <DialogDescription className="text-sm mt-2">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="example@email.com"
              type="email"
              dir="ltr"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="bg-background/50 h-11 pr-10"
              disabled={isSending}
            />
          </div>
          <Button
            className="w-full h-11 shadow-md shadow-primary/10"
            onClick={handleReset}
            disabled={isSending || !resetEmail.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جارٍ الإرسال...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-2" />
                <span>إرسال رابط إعادة التعيين</span>
              </>
            )}
          </Button>
        </div>
        <DialogFooter className="sm:justify-center mt-2">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            onClick={() => onOpenChange(false)}
          >
            <ArrowLeft className="h-3 w-3" />
            العودة لتسجيل الدخول
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      {/* Subtle background texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, oklch(0.60 0.20 250) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

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
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
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
          id: (session.user as { id?: string }).id || '',
          email: session.user.email || '',
          name: session.user.name,
          role: (session.user as { role?: string }).role || 'user',
          plan: (session.user as { plan?: string }).plan || 'free',
          avatarUrl: (session.user as { avatarUrl?: string }).avatarUrl || null,
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


  return (
    <div className="min-h-screen flex auth-grid-bg">
      {/* Left branding panel */}
      <AuthBrandingPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:px-8 relative auth-gradient-mesh">
        {/* Subtle background texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.60 0.20 250) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

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
                <GlowInput
                  id="login-email"
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  dir="ltr"
                  autoComplete="email"
                />

                {/* Password */}
                <GlowInput
                  id="login-password"
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  dir="ltr"
                  autoComplete="current-password"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showPassword ? 'visible' : 'hidden'}
                      initial="hide"
                      animate="show"
                      exit="hide"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </GlowInput>
                <p className="text-xs text-muted-foreground -mt-1">
                  كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </p>

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
                  <motion.button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 transition-colors relative inline-block group"
                    onClick={() => setForgotPasswordOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    نسيت كلمة المرور؟
                    <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                  </motion.button>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-shadow"
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
                </motion.div>
              </motion.form>


            </CardContent>

            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{' '}
                <motion.button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors relative inline-block group"
                  onClick={() => setCurrentPage('register')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  سجل الآن
                  <span className="absolute bottom-0 right-0 h-px w-0 bg-primary/40 group-hover:w-full transition-all duration-300" />
                </motion.button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </div>
  );
}
