import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BotManager } from "@/lib/bot-manager";

export async function POST(
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
    const bot = await BotManager.restartBot(id, userId);

    return NextResponse.json(bot);
  } catch (error: any) {
    console.error("Restart bot error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
