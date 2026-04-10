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
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";

    const bot = await db.bot.findFirst({
      where: isAdmin ? { id } : { id, userId },
      include: { envVars: true, _count: { select: { files: true, logs: true } } },
    });

    if (!bot) {
      return NextResponse.json({ error: "البوت غير موجود" }, { status: 404 });
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error("Get bot error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    await (await import("@/lib/bot-manager")).BotManager.deleteBot(id, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete bot error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
