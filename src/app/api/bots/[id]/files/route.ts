import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BotManager } from "@/lib/bot-manager";

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
    const files = await BotManager.getFiles(id, userId);

    return NextResponse.json(files);
  } catch (error: any) {
    console.error("Get files error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}

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
    const body = await req.json();

    const file = await BotManager.addFile(id, userId, {
      path: body.path,
      content: body.content,
      size: body.size || Buffer.byteLength(body.content || "", "utf-8"),
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error: any) {
    console.error("Upload file error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
