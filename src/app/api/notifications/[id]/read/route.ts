import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
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
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const result = await db.$executeRawUnsafe(
      `UPDATE Notification SET read = 1 WHERE id = ? AND "userId" = ?`,
      id,
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark notification as read error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
