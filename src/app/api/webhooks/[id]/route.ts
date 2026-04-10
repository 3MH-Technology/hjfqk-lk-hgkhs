import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();

    const webhook = await db.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: "الويب هوك غير موجود" }, { status: 404 });
    }

    if (webhook.userId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.url !== undefined) {
      if (!body.url.startsWith("https://")) {
        return NextResponse.json(
          { error: "يجب أن يبدأ عنوان URL بـ https://" },
          { status: 400 }
        );
      }
      updateData.url = body.url;
    }
    if (body.events !== undefined) {
      const validEvents = [
        "bot.started",
        "bot.stopped",
        "bot.error",
        "bot.deployed",
      ];
      const events = body.events.filter((e: string) => validEvents.includes(e));
      if (events.length === 0) {
        return NextResponse.json(
          { error: "أحداث غير صالحة" },
          { status: 400 }
        );
      }
      updateData.events = events.join(",");
    }
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }
    if (body.secret !== undefined) {
      updateData.secret = body.secret || null;
    }

    const updated = await db.webhook.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      events: updated.events.split(","),
    });
  } catch (error) {
    console.error("Update webhook error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

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

    const webhook = await db.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      return NextResponse.json({ error: "الويب هوك غير موجود" }, { status: 404 });
    }

    if (webhook.userId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await db.webhook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete webhook error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
