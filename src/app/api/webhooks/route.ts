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

    const userId = (session.user as any).id;
    const webhooks = await db.webhook.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        secret: true,
        isActive: true,
        lastTriggerAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error("Get webhooks error:", error);
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

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "اسم الويب هوك مطلوب" }, { status: 400 });
    }

    if (!body.url || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "عنوان URL مطلوب" }, { status: 400 });
    }

    if (!body.url.startsWith("https://")) {
      return NextResponse.json(
        { error: "يجب أن يبدأ عنوان URL بـ https://" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.events) ||
      body.events.length === 0
    ) {
      return NextResponse.json(
        { error: "يرجى اختيار حدث واحد على الأقل" },
        { status: 400 }
      );
    }

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

    const webhook = await db.webhook.create({
      data: {
        userId,
        name: body.name.trim(),
        url: body.url.trim(),
        events: events.join(","),
        secret: body.secret?.trim() || null,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(
      {
        ...webhook,
        events: webhook.events.split(","),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create webhook error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
