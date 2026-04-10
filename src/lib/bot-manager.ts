import { db } from "@/lib/db";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

const BOTS_DIR = path.join(process.cwd(), "bots");
const runningBots = new Map<string, ChildProcess>();

if (!fs.existsSync(BOTS_DIR)) {
  fs.mkdirSync(BOTS_DIR, { recursive: true });
}

export class BotManager {
  static async createBot(userId: string, data: {
    name: string;
    description?: string;
    language: string;
    githubUrl?: string;
    templateId?: string;
    envVars?: { key: string; value: string }[];
  }) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("المستخدم غير موجود");
    if (user.isBanned) throw new Error("تم تعطيل هذا الحساب");

    const botCount = await db.bot.count({ where: { userId } });
    if (botCount >= user.maxBots) {
      throw new Error(`وصلت إلى الحد الأقصى (${user.maxBots} بوتات)`);
    }

    const { BOT_TEMPLATES } = require("@/lib/templates");
    const template = data.templateId ? BOT_TEMPLATES.find((t: any) => t.id === data.templateId) : null;

    const bot = await db.bot.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        language: template ? template.language : data.language,
        githubUrl: data.githubUrl,
        envVars: data.envVars
          ? {
            create: data.envVars.map((e) => ({ key: e.key, value: e.value })),
          }
          : undefined,
        files: template ? {
          create: template.files.map((f: any) => ({
            path: f.path,
            content: f.content,
            size: f.content.length
          }))
        } : undefined
      },
      include: { envVars: true },
    });

    await BotManager.log(bot.id, "info", `تم إنشاء البوت "${bot.name}" بنجاح${template ? ` باستخدام قالب ${template.name}` : ""}`);
    return bot;
  }

  static async startBot(botId: string, userId: string) {
    const bot = await db.bot.findFirst({
      where: { id: botId, userId },
      include: { envVars: true, files: true }
    });
    if (!bot) throw new Error("البوت غير موجود");

    if (runningBots.has(botId)) {
      throw new Error("البوت يعمل بالفعل");
    }

    await db.bot.update({
      where: { id: botId },
      data: { status: "building" },
    });

    const botDir = path.join(BOTS_DIR, botId);
    if (!fs.existsSync(botDir)) {
      fs.mkdirSync(botDir, { recursive: true });
    }

    if (bot.githubUrl) {
      await BotManager.log(botId, "info", `جاري السحب من GitHub: ${bot.githubUrl}...`);
      try {
        if (fs.readdirSync(botDir).length > 0) {
          fs.rmSync(botDir, { recursive: true, force: true });
          fs.mkdirSync(botDir, { recursive: true });
        }
        await new Promise((resolve, reject) => {
          const git = spawn("git", ["clone", bot.githubUrl, "."], { cwd: botDir });
          git.on("close", (code) => code === 0 ? resolve(null) : reject(new Error(`Git clone failed with code ${code}`)));
        });
        await BotManager.log(botId, "info", "✓ تم السحب بنجاح");
      } catch (err: any) {
        await BotManager.log(botId, "error", `فشل السحب: ${err.message}`);
      }
    } else {
      for (const file of bot.files) {
        const filePath = path.join(botDir, file.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, file.content);
      }
      await BotManager.log(botId, "info", "تم تجهيز ملفات البوت من قاعدة البيانات...");
    }

    const port = 8000 + Math.floor(Math.random() * 2000);
    const env = { ...process.env, PORT: port.toString() };
    bot.envVars.forEach((ev) => {
      env[ev.key] = ev.value;
    });

    let command = "";
    let args: string[] = [];

    if (bot.language === "python") {
      command = "python";
      const mainFile = bot.files.find(f => f.path.endsWith('.py'))?.path || "main.py";
      args = [mainFile];
    } else if (bot.language === "php") {
      command = "php";
      const mainFile = bot.files.find(f => f.path.endsWith('.php'))?.path || "index.php";
      args = ["-S", `localhost:${port}`, mainFile];
    } else {
      throw new Error("لغة غير مدعومة");
    }

    try {
      const child = spawn(command, args, {
        cwd: botDir,
        env,
        detached: false,
      });

      runningBots.set(botId, child);

      child.stdout.on("data", (data) => {
        BotManager.log(botId, "info", data.toString().trim());
      });

      child.stderr.on("data", (data) => {
        BotManager.log(botId, "error", data.toString().trim());
      });

      child.on("close", (code) => {
        runningBots.delete(botId);
        db.bot.update({
          where: { id: botId },
          data: { status: "stopped", containerId: null, port: null },
        }).catch(console.error);
        BotManager.log(botId, "info", `توقف البوت بكود: ${code}`);
      });

      await db.bot.update({
        where: { id: botId },
        data: {
          status: "running",
          containerId: `proc-${child.pid}`,
          port,
        },
      });

      await BotManager.log(botId, "info", `🚀 البوت "${bot.name}" يعمل الآن على المنفذ ${port}`);

      return await db.bot.findUnique({ where: { id: botId } });
    } catch (err: any) {
      await BotManager.log(botId, "error", `فشل التشغيل: ${err.message}`);
      await db.bot.update({
        where: { id: botId },
        data: { status: "error" },
      });
      throw err;
    }
  }

  static async stopBot(botId: string, userId: string) {
    const child = runningBots.get(botId);
    if (child) {
      child.kill();
      runningBots.delete(botId);
    }

    await db.bot.update({
      where: { id: botId },
      data: { status: "stopped", containerId: null, port: null },
    });

    await BotManager.log(botId, "info", `تم إيقاف البوت`);
    return await db.bot.findUnique({ where: { id: botId } });
  }

  static async restartBot(botId: string, userId: string) {
    await BotManager.stopBot(botId, userId);
    return await BotManager.startBot(botId, userId);
  }

  static async deleteBot(botId: string, userId: string) {
    await BotManager.stopBot(botId, userId);
    const botDir = path.join(BOTS_DIR, botId);
    if (fs.existsSync(botDir)) {
      fs.rmSync(botDir, { recursive: true, force: true });
    }
    await db.bot.delete({ where: { id: botId } });
    return { success: true };
  }

  static async log(botId: string, level: string, message: string) {
    if (!message) return;
    try {
      await db.botLog.create({
        data: { botId, level, message: message.substring(0, 1000) },
      });
    } catch (e) {
      console.error("Logging error:", e);
    }
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

    const os = require("os");
    const systemCpu = Math.round(os.loadavg()[0] * 10) || 5;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const systemRam = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const systemUptime = Math.round((os.uptime() / 86400) * 100) / 100;

    return {
      totalBots: bots.length,
      runningBots: running,
      stoppedBots: stopped,
      errorBots: error,
      totalFiles,
      totalLogs,
      cpu: systemCpu,
      ram: systemRam,
      uptime: systemUptime,
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
    return await BotManager.stopBot(botId, "admin");
  }

  static async adminDeleteBot(botId: string) {
    return await BotManager.deleteBot(botId, "admin");
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

