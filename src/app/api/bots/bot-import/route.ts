import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface ImportFile {
  path: string;
  content: string;
  size?: number;
}

interface ImportData {
  exportVersion?: string;
  bot: {
    name?: string;
    description?: string | null;
    language?: string;
    cpuLimit?: number;
    ramLimit?: number;
    autoRestart?: boolean;
  };
  envVarKeys?: string[];
  files?: ImportFile[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Parse request body - support both JSON body and file upload
    let importData: ImportData;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "لم يتم تقديم ملف" }, { status: 400 });
      }
      const text = await file.text();
      try {
        importData = JSON.parse(text) as ImportData;
      } catch {
        return NextResponse.json({ error: "ملف JSON غير صالح" }, { status: 400 });
      }
    } else {
      importData = (await req.json()) as ImportData;
    }

    // Validate import data structure
    if (!importData.bot || !importData.bot.name) {
      return NextResponse.json(
        { error: "بيانات الاستيراد غير صالحة: يجب أن يحتوي على اسم البوت" },
        { status: 400 }
      );
    }

    const botName = importData.bot.name.trim();
    const botLanguage = importData.bot.language || "python";
    const botDescription = importData.bot.description || null;

    if (!botName) {
      return NextResponse.json(
        { error: "اسم البوت مطلوب" },
        { status: 400 }
      );
    }

    // Validate language
    if (!["python", "php"].includes(botLanguage)) {
      return NextResponse.json(
        { error: "اللغة غير مدعومة. يجب أن تكون python أو php" },
        { status: 400 }
      );
    }

    // Validate files
    const files = importData.files || [];
    for (const file of files) {
      if (!file.path || !file.content) {
        return NextResponse.json(
          { error: "كل ملف يجب أن يحتوي على مسار ومحتوى" },
          { status: 400 }
        );
      }
    }

    // Check user bot limit
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const existingBots = await db.bot.count({ where: { userId } });
    if (existingBots >= user.maxBots) {
      return NextResponse.json(
        { error: `وصلت إلى الحد الأقصى للبوتات (${user.maxBots})` },
        { status: 400 }
      );
    }

    // Create the bot
    const newBot = await db.bot.create({
      data: {
        userId,
        name: botName,
        description: botDescription,
        language: botLanguage,
        status: "stopped",
        cpuLimit: importData.bot.cpuLimit ?? 0.5,
        ramLimit: importData.bot.ramLimit ?? 256,
        autoRestart: importData.bot.autoRestart ?? true,
        envVars: {
          create: (importData.envVarKeys || []).map((key) => ({
            key: key.trim(),
            value: "",
          })),
        },
        files: {
          create: files.map((file) => ({
            path: file.path.trim(),
            content: file.content,
            size: file.size || Buffer.byteLength(file.content, "utf-8"),
          })),
        },
      },
    });

    return NextResponse.json(newBot, { status: 201 });
  } catch (error: unknown) {
    console.error("Import bot error:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
