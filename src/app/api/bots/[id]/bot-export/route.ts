import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;
    const isAdmin = (session.user as { role: string }).role === "admin";

    const bot = await db.bot.findFirst({
      where: isAdmin ? { id } : { id, userId },
      include: {
        files: { select: { path: true, content: true, size: true } },
        envVars: { select: { key: true } },
        _count: { select: { files: true, logs: true } },
      },
    });

    if (!bot) {
      return NextResponse.json({ error: "البوت غير موجود" }, { status: 404 });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      platform: "استضافة الذئب",
      bot: {
        name: bot.name,
        description: bot.description || null,
        language: bot.language,
        cpuLimit: bot.cpuLimit,
        ramLimit: bot.ramLimit,
        autoRestart: bot.autoRestart,
      },
      envVarKeys: bot.envVars.map((env) => env.key),
      files: bot.files.map((f) => ({
        path: f.path,
        content: f.content,
        size: f.size,
      })),
    };

    const filename = `${bot.name.replace(/[^a-zA-Z0-9\u0600-\u06FF-_]/g, "_")}-export.json`;
    const jsonStr = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error: unknown) {
    console.error("Export bot error:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
