'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Webhook as WebhookIcon,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Pencil,
  Globe,
  ShieldCheck,
  Link2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface WebhookEvent {
  id: string;
  label: string;
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: 'bot.started', label: 'تشغيل بوت' },
  { id: 'bot.stopped', label: 'إيقاف بوت' },
  { id: 'bot.error', label: 'خطأ في بوت' },
  { id: 'bot.deployed', label: 'نشر بوت' },
];

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string | null;
  isActive: boolean;
  lastTriggerAt: string | null;
  createdAt: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const EVENT_COLORS: Record<string, string> = {
  'bot.started': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bot.stopped': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'bot.error': 'bg-red-500/15 text-red-400 border-red-500/30',
  'bot.deployed': 'bg-primary/15 text-primary border-primary/30',
};

function getEventLabel(eventId: string): string {
  const event = WEBHOOK_EVENTS.find((e) => e.id === eventId);
  return event ? event.label : eventId;
}

function truncateUrl(url: string, maxLen: number = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '...';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'لم يُرسل بعد';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formSecret, setFormSecret] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>(['bot.started', 'bot.error']);
  const [saving, setSaving] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const toggleEvent = (eventId: string) => {
    setFormEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormUrl('');
    setFormSecret('');
    setFormEvents(['bot.started', 'bot.error']);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (webhook: WebhookItem) => {
    setEditingId(webhook.id);
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormSecret(webhook.secret || '');
    setFormEvents([...webhook.events]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('يرجى إدخال اسم الويب هوك');
      return;
    }
    if (!formUrl.trim() || !formUrl.startsWith('https://')) {
      toast.error('يجب أن يبدأ عنوان URL بـ https://');
      return;
    }
    if (formEvents.length === 0) {
      toast.error('يرجى اختيار حدث واحد على الأقل');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: formName.trim(),
        url: formUrl.trim(),
        events: formEvents,
      };

      if (formSecret.trim()) {
        body.secret = formSecret.trim();
      }

      if (editingId) {
        const res = await fetch(`/api/webhooks/${editingId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          toast.success('تم تحديث الويب هوك بنجاح');
          fetchWebhooks();
          setDialogOpen(false);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'فشل في التحديث');
        }
      } else {
        const res = await fetch('/api/webhooks', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          toast.success('تم إنشاء الويب هوك بنجاح');
          fetchWebhooks();
          setDialogOpen(false);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'فشل في الإنشاء');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (webhook: WebhookItem) => {
    try {
      const res = await fetch(`/api/webhooks/${webhook.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !webhook.isActive }),
      });

      if (res.ok) {
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === webhook.id ? { ...w, isActive: !w.isActive } : w
          )
        );
        toast.success(webhook.isActive ? 'تم تعطيل الويب هوك' : 'تم تفعيل الويب هوك');
      }
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        setDeleteId(null);
        toast.success('تم حذف الويب هوك بنجاح');
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل في الحذف');
      }
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error('حدث خطأ');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ عنوان URL');
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
            <WebhookIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">وخدمات الويب</h1>
            <p className="text-sm text-muted-foreground">تكوين إشعارات الأحداث التلقائية</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreateDialog}>
              <Plus className="size-4" />
              إضافة webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 bg-card max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <WebhookIcon className="size-5 text-primary" />
                {editingId ? 'تعديل الويب هوك' : 'إضافة ويب هوك جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'قم بتحديث إعدادات الويب هوك'
                  : 'أنشئ ويب هوك جديد لاستقبال إشعارات الأحداث'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="webhook-name">اسم الويب هوك</Label>
                <Input
                  id="webhook-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: إشعارات البوت"
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  عنوان URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="webhook-url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/bot"
                  dir="ltr"
                />
              </div>

              {/* Secret */}
              <div className="space-y-2">
                <Label htmlFor="webhook-secret" className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  مفتاح التوقيع (Secret)
                </Label>
                <Input
                  id="webhook-secret"
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                  placeholder="whsec_... (اختياري)"
                  dir="ltr"
                  type="password"
                />
                <p className="text-[11px] text-muted-foreground">
                  يُستخدم لتوقيع الحمولة والتحقق من هوية المرسل (اختياري)
                </p>
              </div>

              {/* Events */}
              <div className="space-y-3">
                <Label className="flex items-center gap-1.5">
                  <Link2 className="size-3.5" />
                  الأحداث المطلوبة
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <label
                      key={event.id}
                      className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                    >
                      <Checkbox
                        checked={formEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <div className="min-w-0">
                        <span className="text-sm block">{event.label}</span>
                        <code className="text-[10px] text-muted-foreground" dir="ltr">{event.id}</code>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formName.trim() || !formUrl.trim() || formEvents.length === 0 || saving}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <WebhookIcon className="size-4" />
                )}
                {editingId ? 'حفظ التعديلات' : 'إضافة الويب هوك'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            الويب هوكات ({webhooks.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-72" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {webhooks.map((webhook) => (
              <motion.div
                key={webhook.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
              >
                <Card className="border-border/50 hover:border-border/80 transition-colors">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      {/* Name + Status + URL */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-medium text-sm">{webhook.name}</h3>
                            <span
                              className={`relative flex size-2.5 shrink-0 ${
                                webhook.isActive ? '' : 'opacity-40'
                              }`}
                            >
                              {webhook.isActive && (
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex size-2.5 rounded-full ${
                                  webhook.isActive ? 'bg-emerald-500' : 'bg-gray-500'
                                }`}
                              />
                            </span>
                          </div>
                          {/* URL */}
                          <div className="flex items-center gap-2">
                            <Globe className="size-4 text-muted-foreground shrink-0" />
                            <code
                              className="text-xs text-foreground/80 bg-muted/50 px-2 py-1 rounded font-mono truncate"
                              dir="ltr"
                              title={webhook.url}
                            >
                              {truncateUrl(webhook.url, 50)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopyUrl(webhook.url)}
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Action buttons + Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={webhook.isActive}
                            onCheckedChange={() => handleToggleActive(webhook)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(webhook)}
                            title="تعديل"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(webhook.id)}
                            title="حذف"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Events badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {webhook.events.map((eventId) => (
                          <Badge
                            key={eventId}
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${EVENT_COLORS[eventId] || 'bg-muted text-muted-foreground border-border'}`}
                          >
                            {getEventLabel(eventId)}
                          </Badge>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          أنشئ: {formatDate(webhook.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          آخر إرسال: {formatDate(webhook.lastTriggerAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Empty state */}
        {!loading && webhooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <WebhookIcon className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-muted-foreground">
              لا توجد وخدمات ويب
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
              أضف ويب هوك جديد لاستقبال إشعارات فورية عند حدوث أحداث في بوتاتك
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border/50 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              حذف الويب هوك
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الويب هوك؟ لن تتلقى إشعارات الأحداث على هذا العنوان بعد الآن. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 ml-2 animate-spin" />
              ) : (
                <Trash2 className="size-4 ml-2" />
              )}
              حذف الويب هوك
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
