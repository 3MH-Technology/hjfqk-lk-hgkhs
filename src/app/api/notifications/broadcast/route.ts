import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const role = (session.user as { role: string }).role;
    if (role !== "admin" && role !== "developer") {
      return NextResponse.json(
        { error: "غير مصرح - صلاحيات المطور مطلوبة" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "العنوان والرسالة مطلوبان" },
        { status: 400 }
      );
    }

    // Get all users
    const users = await db.user.findMany({
      select: { id: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Create a notification for every user
    const notifications = await db.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
        type: type || "announcement",
      })),
    });

    return NextResponse.json({
      success: true,
      count: notifications.count,
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
