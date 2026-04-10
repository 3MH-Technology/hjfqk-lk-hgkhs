import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    await db.$executeRawUnsafe(
      `UPDATE Notification SET read = 1 WHERE "userId" = ? AND read = 0`,
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all notifications as read error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
