'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Webhook as WebhookIcon,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Clock,
  Pencil,
  Send,
  Globe,
  ShieldCheck,
  Link2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

interface WebhookEvent {
  id: string;
  label: string;
}

const WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: 'bot.created', label: 'إنشاء بوت' },
  { id: 'bot.started', label: 'تشغيل بوت' },
  { id: 'bot.stopped', label: 'إيقاف بوت' },
  { id: 'bot.error', label: 'خطأ في بوت' },
  { id: 'bot.restarted', label: 'إعادة تشغيل بوت' },
  { id: 'bot.deployed', label: 'نشر بوت' },
];

interface DeliveryRecord {
  id: string;
  webhookId: string;
  url: string;
  event: string;
  statusCode: number;
  duration: string;
  timestamp: string;
  success: boolean;
}

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  contentType: string;
  active: boolean;
  createdAt: string;
  lastDelivery: {
    statusCode: number | null;
    time: string;
  };
  deliveries: DeliveryRecord[];
}

// Delivery records loaded from API

// Webhooks loaded from API

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
} as const;

const fadeInVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' as const } },
} as const;

function getEventLabel(eventId: string): string {
  const event = WEBHOOK_EVENTS.find((e) => e.id === eventId);
  return event ? event.label : eventId;
}

function getEventBadgeColor(eventId: string): string {
  const colorMap: Record<string, string> = {
    'bot.created': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'bot.started': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'bot.stopped': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    'bot.error': 'bg-red-500/15 text-red-400 border-red-500/30',
    'bot.restarted': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    'bot.deployed': 'bg-primary/15 text-primary border-primary/30',
  };
  return colorMap[eventId] || 'bg-muted text-muted-foreground border-border';
}

function truncateUrl(url: string, maxLen: number = 40): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen) + '...';
}

export default function WebhooksPage() {
  const { user } = useAppStore();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [allDeliveries] = useState<DeliveryRecord[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Create webhook form state
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['bot.created', 'bot.error']);
  const [contentType, setContentType] = useState('application/json');
  const [webhookActive, setWebhookActive] = useState(true);

  // Edit mode
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const resetForm = () => {
    setWebhookUrl('');
    setWebhookSecret('');
    setSelectedEvents(['bot.created', 'bot.error']);
    setContentType('application/json');
    setWebhookActive(true);
    setEditingWebhook(null);
  };

  const handleCloseDialog = (open: boolean) => {
    setCreateOpen(open);
    if (!open) resetForm();
  };

  const openEditDialog = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setWebhookUrl(webhook.url);
    setWebhookSecret(webhook.secret);
    setSelectedEvents([...webhook.events]);
    setContentType(webhook.contentType);
    setWebhookActive(webhook.active);
    setCreateOpen(true);
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error('يرجى إدخال عنوان URL');
      return;
    }
    if (!webhookUrl.startsWith('https://')) {
      toast.error('يجب أن يبدأ عنوان URL بـ https://');
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error('يرجى اختيار حدث واحد على الأقل');
      return;
    }

    if (editingWebhook) {
      // Update existing
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === editingWebhook.id
            ? {
                ...w,
                url: webhookUrl.trim(),
                secret: webhookSecret.trim() || w.secret,
                events: [...selectedEvents],
                contentType,
                active: webhookActive,
              }
            : w
        )
      );
      toast.success('تم تحديث الويب هوك بنجاح');
    } else {
      // Create new
      const newWebhook: Webhook = {
        id: `w${Date.now()}`,
        url: webhookUrl.trim(),
        secret: webhookSecret.trim() || 'whsec_' + Math.random().toString(36).slice(2, 8),
        events: [...selectedEvents],
        contentType,
        active: webhookActive,
        createdAt: new Date().toISOString().split('T')[0],
        lastDelivery: { statusCode: null, time: 'لم يُرسل بعد' },
        deliveries: [],
      };
      setWebhooks((prev) => [newWebhook, ...prev]);
      toast.success('تم إنشاء الويب هوك بنجاح');
    }

    handleCloseDialog(false);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    setDeleteId(null);
    toast.success('تم حذف الويب هوك بنجاح');
  };

  const handleTestWebhook = async (id: string) => {
    setTestingId(id);
    // Simulate test delivery
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const success = Math.random() > 0.3;
    setTestingId(null);
    if (success) {
      toast.success('تم إرسال طلب اختبار بنجاح (200 OK)');
    } else {
      toast.error('فشل إرسال طلب الاختبار (Connection timeout)');
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

        <Dialog open={createOpen} onOpenChange={handleCloseDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { if (editingWebhook) resetForm(); }}>
              <Plus className="size-4" />
              إنشاء ويب هوك
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 bg-card max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <WebhookIcon className="size-5 text-primary" />
                {editingWebhook ? 'تعديل الويب هوك' : 'إنشاء ويب هوك جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingWebhook
                  ? 'قم بتحديث إعدادات الويب هوك'
                  : 'أنشئ ويب هوك جديد لاستقبال إشعارات الأحداث'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="flex items-center gap-1.5">
                  <Globe className="size-3.5" />
                  عنوان URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
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
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  dir="ltr"
                  type="password"
                />
                <p className="text-[11px] text-muted-foreground">
                  يُستخدم لتوقيع الحمولة والتحقق من هوية المرسل
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
                        checked={selectedEvents.includes(event.id)}
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

              {/* Content Type */}
              <div className="space-y-2">
                <Label>نوع المحتوى</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="application/json">application/json</SelectItem>
                    <SelectItem value="application/x-www-form-urlencoded">
                      application/x-www-form-urlencoded
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
                <div>
                  <Label className="text-sm">تفعيل الويب هوك</Label>
                  <p className="text-[11px] text-muted-foreground">
                    سيتم إرسال الأحداث فوراً عند التفعيل
                  </p>
                </div>
                <Switch checked={webhookActive} onCheckedChange={setWebhookActive} />
              </div>
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => handleCloseDialog(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleSaveWebhook}
                disabled={!webhookUrl.trim() || selectedEvents.length === 0}
                className="gap-2"
              >
                <WebhookIcon className="size-4" />
                {editingWebhook ? 'حفظ التعديلات' : 'إنشاء الويب هوك'}
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
                    {/* URL + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {/* Status dot */}
                          <span
                            className={`relative flex size-2.5 shrink-0 ${
                              webhook.active ? '' : 'opacity-40'
                            }`}
                          >
                            {webhook.active && (
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            )}
                            <span
                              className={`relative inline-flex size-2.5 rounded-full ${
                                webhook.active ? 'bg-emerald-500' : 'bg-gray-500'
                              }`}
                            />
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              webhook.active
                                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]'
                                : 'text-muted-foreground border-border bg-muted/50 text-[10px]'
                            }
                          >
                            {webhook.active ? 'نشط' : 'معطل'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/50" dir="ltr">
                            {webhook.contentType === 'application/json' ? 'JSON' : 'Form'}
                          </Badge>
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

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
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
                          className="size-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleTestWebhook(webhook.id)}
                          disabled={testingId === webhook.id}
                          title="اختبار"
                        >
                          {testingId === webhook.id ? (
                            <Send className="size-4 animate-pulse" />
                          ) : (
                            <Send className="size-4" />
                          )}
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
                          className={`text-[10px] px-1.5 py-0 ${getEventBadgeColor(eventId)}`}
                        >
                          {getEventLabel(eventId)}
                        </Badge>
                      ))}
                    </div>

                    {/* Last delivery info */}
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Send className="size-3" />
                        آخر إرسال: {webhook.lastDelivery.time}
                      </span>
                      {webhook.lastDelivery.statusCode && (
                        <Badge
                          variant="outline"
                          className={
                            webhook.lastDelivery.statusCode >= 200 && webhook.lastDelivery.statusCode < 300
                              ? 'text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0'
                              : 'text-red-400 border-red-500/30 text-[10px] px-1.5 py-0'
                          }
                          dir="ltr"
                        >
                          {webhook.lastDelivery.statusCode}
                        </Badge>
                      )}
                    </div>

                    {/* Recent deliveries mini-table */}
                    {webhook.deliveries.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-muted-foreground font-medium">آخر عمليات الإرسال</p>
                        <div className="rounded-lg border border-border/50 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[10px] text-muted-foreground h-8">الحدث</TableHead>
                                <TableHead className="text-[10px] text-muted-foreground h-8">الحالة</TableHead>
                                <TableHead className="text-[10px] text-muted-foreground h-8">الوقت</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {webhook.deliveries.slice(0, 3).map((delivery) => (
                                <TableRow key={delivery.id} className="hover:bg-muted/20">
                                  <TableCell className="text-[11px] py-2">
                                    <code dir="ltr" className="text-[10px]">{delivery.event}</code>
                                  </TableCell>
                                  <TableCell className="py-2">
                                    <Badge
                                      variant="outline"
                                      className={
                                        delivery.success
                                          ? 'text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0'
                                          : 'text-red-400 border-red-500/30 text-[10px] px-1.5 py-0'
                                      }
                                      dir="ltr"
                                    >
                                      {delivery.statusCode}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-[11px] text-muted-foreground py-2">
                                    {delivery.timestamp}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {webhooks.length === 0 && (
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
              أنشئ ويب هوك جديد لاستقبال إشعارات فورية عند حدوث أحداث في بوتاتك
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Delivery Log Section */}
      <Separator />
      <div className="space-y-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Send className="size-4 text-primary" />
          سجل عمليات الإرسال
        </h2>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-xs text-muted-foreground">عنوان URL</TableHead>
                    <TableHead className="text-xs text-muted-foreground">الحدث</TableHead>
                    <TableHead className="text-xs text-muted-foreground">رمز الحالة</TableHead>
                    <TableHead className="text-xs text-muted-foreground">المدة</TableHead>
                    <TableHead className="text-xs text-muted-foreground">الوقت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDeliveries.map((delivery) => (
                    <TableRow key={delivery.id} className="hover:bg-muted/20">
                      <TableCell className="py-2.5">
                        <code className="text-[11px] text-foreground/80 font-mono truncate max-w-[200px] block" dir="ltr" title={delivery.url}>
                          {truncateUrl(delivery.url, 30)}
                        </code>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${getEventBadgeColor(delivery.event)}`}
                        >
                          {getEventLabel(delivery.event)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Badge
                          variant="outline"
                          className={
                            delivery.success
                              ? 'text-emerald-400 border-emerald-500/30 text-[11px] px-1.5 py-0 font-mono'
                              : 'text-red-400 border-red-500/30 text-[11px] px-1.5 py-0 font-mono'
                          }
                          dir="ltr"
                        >
                          {delivery.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                          {delivery.duration}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-[11px] text-muted-foreground">
                          {delivery.timestamp}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

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
              onClick={() => deleteId && handleDeleteWebhook(deleteId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="size-4 ml-2" />
              حذف الويب هوك
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
