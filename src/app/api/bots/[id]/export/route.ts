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
        files: { select: { id: true, path: true, size: true, createdAt: true, updatedAt: true } },
        envVars: { select: { key: true, value: true, createdAt: true } },
        _count: { select: { files: true, logs: true } },
      },
    });

    if (!bot) {
      return NextResponse.json({ error: "البوت غير موجود" }, { status: 404 });
    }

    // Mask secret values in env vars
    const maskedEnvVars = bot.envVars.map((env) => ({
      key: env.key,
      value: env.value.length > 4
        ? env.value.slice(0, 2) + "*".repeat(env.value.length - 2)
        : "****",
      createdAt: env.createdAt,
    }));

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      bot: {
        id: bot.id,
        name: bot.name,
        description: bot.description || null,
        language: bot.language,
        status: bot.status,
        containerId: bot.containerId || null,
        port: bot.port || null,
        cpuLimit: bot.cpuLimit,
        ramLimit: bot.ramLimit,
        autoRestart: bot.autoRestart,
        githubUrl: bot.githubUrl || null,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt,
      },
      statistics: {
        totalFiles: bot._count.files,
        totalLogs: bot._count.logs,
      },
      envVars: maskedEnvVars,
      files: bot.files.map((f) => ({
        id: f.id,
        path: f.path,
        size: f.size,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export bot error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
