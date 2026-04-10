import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BotManager } from "@/lib/bot-manager";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id, fileId } = await params;
    const userId = (session.user as any).id;
    const file = await BotManager.getFile(id, fileId, userId);

    if (!file) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id, fileId } = await params;
    const userId = (session.user as any).id;
    await BotManager.deleteFile(id, fileId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
