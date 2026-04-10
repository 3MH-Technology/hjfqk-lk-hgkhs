import { Server } from 'socket.io';

const PORT = 3004;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Mock bot IDs
const botIds = ['bot-001', 'bot-002', 'bot-003', 'bot-004', 'bot-005'];
const botNames: Record<string, string> = {
  'bot-001': 'بوت المساعد',
  'bot-002': 'بوت الإشعارات',
  'bot-003': 'بوت المدير',
  'bot-004': 'بوت الدعم الفني',
  'bot-005': 'بوت التحليلات',
};

// Log levels
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const levels: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

// Arabic log messages per level
const logMessages: Record<LogLevel, string[]> = {
  INFO: [
    'تم بدء تشغيل البوت بنجاح',
    'جاري معالجة الرسائل الواردة',
    'تم تسجيل الدخول بنجاح',
    'تم تحديث الإعدادات',
    'البوت متصل بالخادم',
    'تم إرسال الإشعار للمستخدم',
    'جاري مزامنة البيانات',
    'تم إنهاء المهمة بنجاح',
    'تم استلام طلب API جديد',
    'الذاكرة المستخدمة ضمن الحدود المسموحة',
    'تم تحديث قاعدة البيانات',
    'تم تنفيذ الأمر بنجاح',
    'الاجتياز المجدول يعمل بشكل طبيعي',
    'تم إعادة الاتصال بعد انقطاع قصير',
    'استقبال تحديثات من خادم تيليجرام',
  ],
  WARN: [
    'استخدام الذاكرة مرتفع (85%)',
    'تباطؤ في استجابة API',
    'عدد الطلبات يتجاوز المعدل الطبيعي',
    'انتهاء صلاحية الرمز قريباً',
    'اتصال بطيء بقاعدة البيانات',
    'تنبيه: حجم الملفات يتجاوز الحد المسموح',
    'عدة محاولات فاشلة لإعادة الاتصال',
    'وقت الاستجابة أعلى من المتوسط',
    'تحذير: معدل الأخطاء مرتفع',
    'تنبيه: القرص يقترب من الامتلاء',
  ],
  ERROR: [
    'فشل الاتصال بقاعدة البيانات',
    'خطأ في مصادقة المستخدم',
    'فشل إرسال الإشعار',
    'خطأ 500: خادم داخلي',
    'انتهت مهلة الطلب',
    'فشل تحديث الرمز المميز',
    'خطأ في تحليل البيانات الواردة',
    'فشل الاتصال بخادم تيليجرام',
    'خطأ غير معروف في معالج الرسائل',
    'فشل النشر: أخطاء في البناء',
  ],
  DEBUG: [
    'جاري فحص حالة الاتصال',
    'معلومات التصحيح: طلب HTTP GET',
    'بيانات الطلب: {method: POST, url: /api/bots}',
    'تم تحميل الوحدة النمطية بنجاح',
    'حالة الذاكرة: 256MB / 512MB',
    'عدد الاتصالات النشطة: 15',
    'فحص ping: 12ms',
    'معلومات النظام: Node.js v20.x',
    'جاري تنفيذ مهمة مجدولة...',
    'تم تحديث ذاكرة التخزين المؤقت',
  ],
};

// Special event messages
const eventMessages = [
  { level: 'INFO' as LogLevel, event: 'bot_started', message: 'تم بدء تشغيل البوت بنجاح' },
  { level: 'INFO' as LogLevel, event: 'bot_stopped', message: 'تم إيقاف البوت' },
  { level: 'WARN' as LogLevel, event: 'error_occurred', message: 'حدث خطأ غير متوقع' },
  { level: 'INFO' as LogLevel, event: 'deployment_completed', message: 'تم إنهاء النشر بنجاح' },
];

// Generate a random log entry
function generateLogEntry(botId?: string): {
  level: LogLevel;
  message: string;
  timestamp: string;
  botId: string;
  event?: string;
} {
  const selectedBotId = botId || botIds[Math.floor(Math.random() * botIds.length)];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const messages = logMessages[level];
  const message = messages[Math.floor(Math.random() * messages.length)];

  const now = new Date();
  const timestamp = now.toISOString();

  // 10% chance of a special event
  const isEvent = Math.random() < 0.1;
  if (isEvent) {
    const evt = eventMessages[Math.floor(Math.random() * eventMessages.length)];
    return {
      level: evt.level,
      message: `[${botNames[selectedBotId] || selectedBotId}] ${evt.message}`,
      timestamp,
      botId: selectedBotId,
      event: evt.event,
    };
  }

  return {
    level,
    message: `[${botNames[selectedBotId] || selectedBotId}] ${message}`,
    timestamp,
    botId: selectedBotId,
  };
}

// Active client subscriptions: Map<socketId, botId | null>
const clientSubscriptions = new Map<string, string | null>();
const clientIntervals = new Map<string, ReturnType<typeof setInterval>>();

function getRandomInterval(): number {
  return 2000 + Math.floor(Math.random() * 3000); // 2-5 seconds
}

function startStreaming(socketId: string, botId?: string) {
  // Clear existing interval
  if (clientIntervals.has(socketId)) {
    clearInterval(clientIntervals.get(socketId)!);
  }

  const subscribedBotId = botId || null;
  clientSubscriptions.set(socketId, subscribedBotId);

  const interval = setInterval(() => {
    const entry = generateLogEntry(subscribedBotId || undefined);
    io.to(socketId).emit('log', entry);
  }, getRandomInterval());

  clientIntervals.set(socketId, interval);
}

function stopStreaming(socketId: string) {
  if (clientIntervals.has(socketId)) {
    clearInterval(clientIntervals.get(socketId)!);
    clientIntervals.delete(socketId);
  }
  clientSubscriptions.delete(socketId);
}

io.on('connection', (socket) => {
  console.log(`[log-stream] Client connected: ${socket.id}`);

  // Send welcome message
  socket.emit('connected', {
    message: 'تم الاتصال بخدمة السجلات المباشرة',
    serverTime: new Date().toISOString(),
    availableBots: botIds.map((id) => ({ id, name: botNames[id] })),
  });

  // Start streaming logs immediately
  startStreaming(socket.id);

  // Client subscribes to specific bot
  socket.on('subscribe', (data: { botId?: string }) => {
    console.log(`[log-stream] Client ${socket.id} subscribed to bot: ${data.botId || 'all'}`);
    startStreaming(socket.id, data.botId);
    socket.emit('subscribed', { botId: data.botId || 'all' });
  });

  // Client unsubscribes (back to all bots)
  socket.on('unsubscribe', () => {
    console.log(`[log-stream] Client ${socket.id} unsubscribed`);
    startStreaming(socket.id);
    socket.emit('subscribed', { botId: 'all' });
  });

  // Client pauses stream
  socket.on('pause', () => {
    console.log(`[log-stream] Client ${socket.id} paused stream`);
    stopStreaming(socket.id);
    socket.emit('stream_paused');
  });

  // Client resumes stream
  socket.on('resume', () => {
    console.log(`[log-stream] Client ${socket.id} resumed stream`);
    const subscribedBotId = clientSubscriptions.get(socket.id);
    startStreaming(socket.id, subscribedBotId || undefined);
    socket.emit('stream_resumed');
  });

  // Client requests connection test
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  // Broadcast random events to all connected clients
  function broadcastEvent() {
    const botId = botIds[Math.floor(Math.random() * botIds.length)];
    const evt = eventMessages[Math.floor(Math.random() * eventMessages.length)];
    const entry = {
      level: evt.level,
      message: `[${botNames[botId]}] ⚡ ${evt.message}`,
      timestamp: new Date().toISOString(),
      botId,
      event: evt.event,
    };
    io.emit('log', entry);
  }

  // Broadcast events every 15-30 seconds
  const eventInterval = setInterval(() => {
    const clientsCount = io.sockets.sockets.size;
    if (clientsCount > 0) {
      broadcastEvent();
    }
  }, 15000 + Math.floor(Math.random() * 15000));

  socket.on('disconnect', () => {
    console.log(`[log-stream] Client disconnected: ${socket.id}`);
    stopStreaming(socket.id);
    if (io.sockets.sockets.size === 0) {
      clearInterval(eventInterval);
    }
  });
});

console.log(`[log-stream] Log streaming service running on port ${PORT}`);
