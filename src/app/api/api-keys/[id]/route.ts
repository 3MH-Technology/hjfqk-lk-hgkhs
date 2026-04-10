import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const apiKey = await db.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "المفتاح غير موجود" }, { status: 404 });
    }

    if (apiKey.userId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await db.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API key error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
