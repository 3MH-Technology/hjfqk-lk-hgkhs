import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم غير موجود" }, { status: 401 });
    }

    const notifications = await db.$queryRawUnsafe(
      `SELECT id, "userId", type, title, message, read, link, "createdAt" FROM Notification WHERE "userId" = ? ORDER BY "createdAt" DESC LIMIT 50`,
      userId
    ) as Array<{
      id: string;
      userId: string;
      type: string;
      title: string;
      message: string;
      read: number;
      link: string | null;
      createdAt: string;
    }>;

    const result = notifications.map(n => ({
      ...n,
      read: Number(n.read) === 1,
    }));

    return NextResponse.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Get notifications error:", errMsg);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم غير موجود" }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, message, link, targetUserId } = body;

    const isAdmin = (session.user as { role: string }).role === "admin";
    const recipientId = isAdmin && targetUserId ? targetUserId : userId;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await db.$executeRawUnsafe(
      `INSERT INTO Notification (id, "userId", type, title, message, read, link, "createdAt") VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`,
      id,
      recipientId,
      type || "info",
      title || "إشعار جديد",
      message || "",
      link || null
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Create notification error:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
