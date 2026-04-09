'use client';

import { useState } from 'react';
import {
  Bot,
  MessageSquare,
  ShoppingBag,
  Music,
  Gamepad2,
  BookOpen,
  Image,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  language: string;
  files: { path: string; content: string }[];
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'echo-bot',
    name: 'بوتEcho',
    description: 'بوت بسيط يعيد إرسال الرسائل المستلمة',
    icon: <MessageSquare className="h-6 w-6" />,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    language: 'python',
    tags: ['مبتدئ', 'تعليمي'],
    files: [
      {
        path: 'main.py',
        content: `from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Echo bot - يعيد إرسال الرسائل
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("مرحباً! أنا بوت Echo 👋\\nأرسل أي رسالة وسأعيدها لك.")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(update.message.text)

if __name__ == '__main__':
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    print("Bot is running...")
    app.run_polling()
`,
      },
      {
        path: 'requirements.txt',
        content: `python-telegram-bot==20.7
`,
      },
    ],
  },
  {
    id: 'store-bot',
    name: 'بوت متجر',
    description: 'بوت لعرض المنتجات وإدارة الطلبات',
    icon: <ShoppingBag className="h-6 w-6" />,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    language: 'python',
    tags: ['متقدم', 'تجارة'],
    files: [
      {
        path: 'main.py',
        content: `from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

products = [
    {"id": 1, "name": "منتج A", "price": 50},
    {"id": 2, "name": "منتج B", "price": 100},
]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🏪 مرحباً بك في متجرنا!\\nاستخدم /products لعرض المنتجات")

async def products(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "📦 المنتجات المتاحة:\\n\\n"
    for p in products:
        text += f"• {p['name']} - {p['price']} ر.س\\n"
    await update.message.reply_text(text)

if __name__ == '__main__':
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("products", products))
    print("Store bot running...")
    app.run_polling()
`,
      },
      {
        path: 'requirements.txt',
        content: `python-telegram-bot==20.7
`,
      },
    ],
  },
  {
    id: 'quiz-bot',
    name: 'بوت مسابقات',
    description: 'بوت أسئلة وأجوبة تفاعلي مع نقاط',
    icon: <Gamepad2 className="h-6 w-6" />,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    language: 'python',
    tags: ['ترفيه', 'متوسط'],
    files: [
      {
        path: 'main.py',
        content: `from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import random

questions = [
    {"q": "ما عاصمة فرنسا؟", "a": "باريس"},
    {"q": "كم عدد كواكب المجموعة الشمسية؟", "a": "8"},
    {"q": "ما أكبر محيط في العالم؟", "a": "المحيط الهادئ"},
]

scores = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    scores[update.effective_user.id] = 0
    await update.message.reply_text("🎮 مرحباً في بوت المسابقات!\\nاستخدم /quiz لبدء الأسئلة")

async def quiz(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = random.choice(questions)
    await update.message.reply_text(f"❓ {q['q']}")

async def answer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    if uid in scores:
        scores[uid] += 1
        await update.message.reply_text(f"✅ إجابة صحيحة! نقاطك: {scores[uid]}")

if __name__ == '__main__':
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("quiz", quiz))
    print("Quiz bot running...")
    app.run_polling()
`,
      },
      {
        path: 'requirements.txt',
        content: `python-telegram-bot==20.7
`,
      },
    ],
  },
  {
    id: 'media-bot',
    name: 'بوت وسائط',
    description: 'بوت لتحميل وتحويل الصور والملفات',
    icon: <Image className="h-6 w-6" />,
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    language: 'python',
    tags: ['وسائط', 'أدوات'],
    files: [
      {
        path: 'main.py',
        content: `from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🖼️ بوت الوسائط\\nأرسل صورة وسأحفظها لك!")

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    photo = update.message.photo[-1]
    await update.message.reply_text(f"📸 تم استلام الصورة!\\nالحجم: {photo.file_size} بايت")

if __name__ == '__main__':
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    print("Media bot running...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)
`,
      },
      {
        path: 'requirements.txt',
        content: `python-telegram-bot==20.7
Pillow==10.2.0
`,
      },
    ],
  },
  {
    id: 'php-bot',
    name: 'بوت PHP',
    description: 'قالب أساسي لبوت PHP مع Webhook',
    icon: <Download className="h-6 w-6" />,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    language: 'php',
    tags: ['PHP', 'Webhook'],
    files: [
      {
        path: 'index.php',
        content: `<?php
// بوت تيليجرام بـ PHP
$token = "YOUR_BOT_TOKEN";
$apiUrl = "https://api.telegram.org/bot$token/";

$update = json_decode(file_get_contents("php://input"), true);
$chatId = $update["message"]["chat"]["id"];
$text = $update["message"]["text"] ?? "";

switch ($text) {
    case "/start":
        $response = "مرحباً! 👋\\nأنا بوت PHP";
        break;
    default:
        $response = "أنت قلت: " . $text;
}

file_get_contents($apiUrl . "sendMessage?" . http_build_query([
    "chat_id" => $chatId,
    "text" => $response,
]));

echo "OK";
`,
      },
      {
        path: 'composer.json',
        content: `{
    "require": {}
}
`,
      },
    ],
  },
  {
    id: 'book-bot',
    name: 'بوت مكتبة',
    description: 'بوت للبحث وعرض الكتب والمقالات',
    icon: <BookOpen className="h-6 w-6" />,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
    language: 'python',
    tags: ['محتوى', 'بحث'],
    files: [
      {
        path: 'main.py',
        content: `from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

books = [
    {"title": "تعلم Python", "author": "أحمد"},
    {"title": "برمجة بوتات", "author": "محمد"},
]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📚 مرحباً في مكتبتنا!\\nاستخدم /books لعرض الكتب")

async def books(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = "📖 الكتب المتاحة:\\n\\n"
    for b in books:
        text += f"📕 {b['title']} - {b['author']}\\n"
    await update.message.reply_text(text)

async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = " ".join(context.args) if context.args else ""
    if not query:
        await update.message.reply_text("استخدم: /search كلمة البحث")
        return
    found = [b for b in books if query in b["title"] or query in b["author"]]
    if found:
        text = "🔍 نتائج البحث:\\n\\n"
        for b in found:
            text += f"📕 {b['title']} - {b['author']}\\n"
    else:
        text = "لم يتم العثور على نتائج"
    await update.message.reply_text(text)

if __name__ == '__main__':
    app = Application.builder().token("YOUR_BOT_TOKEN").build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("books", books))
    app.add_handler(CommandHandler("search", search))
    print("Library bot running...")
    app.run_polling()
`,
      },
      {
        path: 'requirements.txt',
        content: `python-telegram-bot==20.7
`,
      },
    ],
  },
];

interface BotTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelected: (template: Template) => void;
}

export function BotTemplates({ open, onOpenChange, onTemplateSelected }: BotTemplatesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (template: Template) => {
    setSelected(template.id);
  };

  const handleUseTemplate = async () => {
    const template = templates.find((t) => t.id === selected);
    if (!template) return;

    toast.loading('جاري إنشاء البوت من القالب...', { id: 'template-create' });

    try {
      onTemplateSelected(template);
      toast.success(`تم إنشاء بوت "${template.name}" بنجاح`, { id: 'template-create' });
      onOpenChange(false);
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || 'فشل في إنشاء البوت', { id: 'template-create' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div
        className="bg-card border border-border/50 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">قوالب البوتات</h2>
              <p className="text-sm text-muted-foreground">اختر قالباً للبدء بسرعة</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`text-right p-4 rounded-xl border transition-all duration-200 group ${
                  selected === template.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                    : 'border-border/50 bg-card/50 hover:bg-accent/50 hover:border-primary/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl ${template.iconBg} flex items-center justify-center ${template.iconColor} shrink-0 group-hover:scale-105 transition-transform`}>
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border/50">
                        {template.language}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                    <div className="flex gap-1.5 mt-2">
                      {template.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {selected === template.id && (
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">
                      الملفات المضمنة:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.files.map((f) => (
                        <span key={f.path} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono" dir="ltr">
                          {f.path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border/50 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {selected ? templates.find((t) => t.id === selected)?.files.length : 0} ملف مضمن
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-border"
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              disabled={!selected}
              onClick={handleUseTemplate}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              استخدام القالب
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { templates, type Template };
