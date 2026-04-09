import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { BotManager } from "@/lib/bot-manager";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const bots = await db.bot.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { files: true, logs: true } } },
    });

    return NextResponse.json(bots);
  } catch (error) {
    console.error("Get bots error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const bot = await BotManager.createBot(userId, {
      name: body.name,
      description: body.description,
      language: body.language || "python",
      githubUrl: body.githubUrl,
      envVars: body.envVars,
    });

    return NextResponse.json(bot, { status: 201 });
  } catch (error: any) {
    console.error("Create bot error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
