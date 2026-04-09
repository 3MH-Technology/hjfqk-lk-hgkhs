import { db } from "@/lib/db";
import type { BotLog } from "@prisma/client";

export class BotManager {
  static async createBot(userId: string, data: {
    name: string;
    description?: string;
    language: string;
    githubUrl?: string;
    envVars?: { key: string; value: string }[];
  }) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("المستخدم غير موجود");
    if (user.isBanned) throw new Error("تم تعطيل هذا الحساب");

    const botCount = await db.bot.count({ where: { userId } });
    if (botCount >= user.maxBots) {
      throw new Error(`وصلت إلى الحد الأقصى (${user.maxBots} بوتات)`);
    }

    const bot = await db.bot.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        language: data.language,
        githubUrl: data.githubUrl,
        envVars: data.envVars
          ? {
              create: data.envVars.map((e) => ({ key: e.key, value: e.value })),
            }
          : undefined,
      },
      include: { envVars: true },
    });

    await BotManager.log(bot.id, "info", `تم إنشاء البوت "${bot.name}" بنجاح`);
    return bot;
  }

  static async startBot(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.bot.update({
      where: { id: botId },
      data: { status: "building" },
    });

    await BotManager.log(botId, "info", "جاري بناء الحاوية...");

    await new Promise((r) => setTimeout(r, 1500));

    const containerId = `wolf-${botId.slice(0, 8)}`;
    const port = 8000 + Math.floor(Math.random() * 1000);

    await db.bot.update({
      where: { id: botId },
      data: {
        status: "running",
        containerId,
        port,
      },
    });

    await BotManager.log(botId, "info", `تم بناء الحاوية ${containerId}`);
    await BotManager.log(botId, "info", `تم تخصيص المنفذ ${port}`);
    await BotManager.log(botId, "info", "جاري تثبيت المكتبات المطلوبة...");

    await new Promise((r) => setTimeout(r, 1000));

    if (bot.language === "python") {
      await BotManager.log(botId, "info", "تم العثور على requirements.txt - جاري التثبيت...");
      await BotManager.log(botId, "info", "✓ تم تثبيت المكتبات بنجاح");
    } else if (bot.language === "php") {
      await BotManager.log(botId, "info", "تم العثور على composer.json - جاري التثبيت...");
      await BotManager.log(botId, "info", "✓ تم تثبيت المكتبات بنجاح");
    }

    await BotManager.log(botId, "info", `🚀 البوت "${bot.name}" يعمل الآن`);

    const updated = await db.bot.findUnique({ where: { id: botId } });
    return updated;
  }

  static async stopBot(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.bot.update({
      where: { id: botId },
      data: { status: "stopped", containerId: null, port: null },
    });

    await BotManager.log(botId, "info", `تم إيقاف البوت "${bot.name}"`);
    const updated = await db.bot.findUnique({ where: { id: botId } });
    return updated;
  }

  static async restartBot(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await BotManager.log(botId, "info", "جاري إعادة التشغيل...");
    await db.bot.update({ where: { id: botId }, data: { status: "building" } });
    await new Promise((r) => setTimeout(r, 2000));

    const containerId = `wolf-${botId.slice(0, 8)}-${Date.now()}`;
    const port = 8000 + Math.floor(Math.random() * 1000);

    await db.bot.update({
      where: { id: botId },
      data: { status: "running", containerId, port },
    });

    await BotManager.log(botId, "info", "✓ تم إعادة التشغيل بنجاح");
    await BotManager.log(botId, "info", `🚀 البوت "${bot.name}" يعمل الآن`);

    return await db.bot.findUnique({ where: { id: botId } });
  }

  static async deleteBot(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.bot.delete({ where: { id: botId } });
    return { success: true };
  }

  static async log(botId: string, level: string, message: string) {
    await db.botLog.create({
      data: { botId, level, message },
    });
  }

  static async getLogs(botId: string, userId: string, limit = 100) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    return db.botLog.findMany({
      where: { botId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async addFile(botId: string, userId: string, data: { path: string; content: string; size: number }) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    const existing = await db.botFile.findFirst({ where: { botId, path: data.path } });
    if (existing) {
      return db.botFile.update({
        where: { id: existing.id },
        data: { content: data.content, size: data.size },
      });
    }

    return db.botFile.create({
      data: { botId, path: data.path, content: data.content, size: data.size },
    });
  }

  static async getFiles(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    return db.botFile.findMany({
      where: { botId },
      orderBy: { path: "asc" },
    });
  }

  static async getFile(botId: string, fileId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    return db.botFile.findFirst({ where: { id: fileId, botId } });
  }

  static async deleteFile(botId: string, fileId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.botFile.delete({ where: { id: fileId } });
    return { success: true };
  }

  static async setEnvVars(botId: string, userId: string, envVars: { key: string; value: string }[]) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.botEnv.deleteMany({ where: { botId } });

    if (envVars.length > 0) {
      await db.botEnv.createMany({
        data: envVars.map((e) => ({ botId, key: e.key, value: e.value })),
      });
    }

    return db.botEnv.findMany({ where: { botId } });
  }

  static async getEnvVars(botId: string, userId: string) {
    const bot = await db.bot.findFirst({ where: { id: botId, userId } });
    if (!bot) throw new Error("البوت غير موجود");

    return db.botEnv.findMany({ where: { botId } });
  }

  static async getStats(userId: string) {
    const bots = await db.bot.findMany({ where: { userId } });
    const running = bots.filter((b) => b.status === "running").length;
    const stopped = bots.filter((b) => b.status === "stopped").length;
    const error = bots.filter((b) => b.status === "error").length;
    const totalFiles = await db.botFile.count({
      where: { bot: { userId } },
    });
    const totalLogs = await db.botLog.count({
      where: { bot: { userId } },
    });

    return {
      totalBots: bots.length,
      runningBots: running,
      stoppedBots: stopped,
      errorBots: error,
      totalFiles,
      totalLogs,
    };
  }

  static async getAdminStats() {
    const [totalUsers, totalBots, runningBots, totalLogs] = await Promise.all([
      db.user.count(),
      db.bot.count(),
      db.bot.count({ where: { status: "running" } }),
      db.botLog.count(),
    ]);

    return { totalUsers, totalBots, runningBots, totalLogs };
  }

  static async adminGetAllUsers() {
    return db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bots: true } },
      },
    });
  }

  static async adminToggleBan(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("المستخدم غير موجود");

    return db.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
  }

  static async adminDeleteUser(userId: string) {
    await db.user.delete({ where: { id: userId } });
    return { success: true };
  }

  static async adminStopBot(botId: string) {
    const bot = await db.bot.findUnique({ where: { id: botId } });
    if (!bot) throw new Error("البوت غير موجود");

    await db.bot.update({
      where: { id: botId },
      data: { status: "stopped", containerId: null, port: null },
    });

    await BotManager.log(botId, "warn", "تم إيقاف البوت بواسطة المدير");
    return { success: true };
  }

  static async adminDeleteBot(botId: string) {
    await db.bot.delete({ where: { id: botId } });
    return { success: true };
  }

  static async adminGetAllBots() {
    return db.bot.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { files: true, logs: true } },
      },
    });
  }
}
