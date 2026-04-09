'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreateBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface EnvVar {
  key: string;
  value: string;
}

export function CreateBotDialog({ open, onOpenChange, onCreated }: CreateBotDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<string>('python');
  const [githubUrl, setGithubUrl] = useState('');
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setLanguage('python');
    setGithubUrl('');
    setEnvVars([{ key: '', value: '' }]);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    if (envVars.length <= 1) return;
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...envVars];
    updated[index] = { ...updated[index], [field]: val };
    setEnvVars(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('يرجى إدخال اسم البوت');
      return;
    }

    const validEnvVars = envVars.filter((v) => v.key.trim());
    if (validEnvVars.length !== envVars.filter((v) => v.key.trim()).length) {
      toast.error('تأكد من عدم وجود مفاتيح فارغة');
      return;
    }

    const hasDuplicateKeys = validEnvVars.some(
      (v, i) => validEnvVars.findIndex((x) => x.key.trim() === v.key.trim()) !== i
    );
    if (hasDuplicateKeys) {
      toast.error('توجد مفاتيح مكررة في متغيرات البيئة');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          language,
          githubUrl: githubUrl.trim() || undefined,
          envVars: validEnvVars.length > 0 ? validEnvVars : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل في إنشاء البوت');
      }

      toast.success(`تم إنشاء البوت "${name}" بنجاح`);
      handleClose(false);
      onCreated();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء البوت');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl">إنشاء بوت جديد</DialogTitle>
          <DialogDescription>
            أضف بوت جديد إلى حسابك لبدء استضافته
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bot Name */}
          <div className="space-y-2">
            <Label htmlFor="bot-name">
              اسم البوت <span className="text-red-400">*</span>
            </Label>
            <Input
              id="bot-name"
              placeholder="مثال: بوت الترحيب"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input/50 border-border focus:border-primary"
              disabled={submitting}
              required
            />
          </div>

          {/* Bot Description */}
          <div className="space-y-2">
            <Label htmlFor="bot-description">وصف البوت</Label>
            <Textarea
              id="bot-description"
              placeholder="وصف مختصر لبوتك (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-input/50 border-border focus:border-primary resize-none"
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>لغة البرمجة</Label>
            <Select value={language} onValueChange={setLanguage} disabled={submitting}>
              <SelectTrigger className="w-full bg-input/50 border-border focus:border-primary">
                <SelectValue placeholder="اختر لغة البرمجة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python 🐍</SelectItem>
                <SelectItem value="php">PHP 🐘</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="github-url">رابط GitHub</Label>
            <Input
              id="github-url"
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-input/50 border-border focus:border-primary"
              dir="ltr"
              disabled={submitting}
            />
          </div>

          {/* Environment Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>متغيرات البيئة</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addEnvVar}
                className="h-7 text-xs gap-1 text-primary hover:text-primary/80"
                disabled={submitting}
              >
                <Plus className="size-3" />
                إضافة متغير
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {envVars.map((env, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="المفتاح"
                    value={env.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    className="flex-1 bg-input/50 border-border focus:border-primary h-9 text-sm"
                    disabled={submitting}
                  />
                  <Input
                    placeholder="القيمة"
                    value={env.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    className="flex-1 bg-input/50 border-border focus:border-primary h-9 text-sm"
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEnvVar(index)}
                    className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                    disabled={envVars.length <= 1 || submitting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              المتغيرات التي سيتم تمريرها إلى بيئة البوت
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={submitting}
              className="border-border hover:bg-accent"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-w-[120px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء البوت'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
