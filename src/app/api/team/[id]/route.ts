import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH /api/team/[id] — update member role
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
    const { role } = body;

    if (!role || typeof role !== "string") {
      return NextResponse.json({ error: "الصلاحية مطلوبة" }, { status: 400 });
    }

    const validRoles = ["admin", "developer", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "صلاحية غير صالحة" }, { status: 400 });
    }

    // Find team owned by user
    const team = await db.team.findFirst({ where: { ownerId: userId } });
    if (!team) {
      return NextResponse.json({ error: "الفريق غير موجود" }, { status: 404 });
    }

    const member = await db.teamMember.findFirst({
      where: { id, teamId: team.id },
    });

    if (!member) {
      return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
    }

    const updated = await db.teamMember.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// DELETE /api/team/[id] — remove member
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

    // Find team owned by user
    const team = await db.team.findFirst({ where: { ownerId: userId } });
    if (!team) {
      return NextResponse.json({ error: "الفريق غير موجود" }, { status: 404 });
    }

    const member = await db.teamMember.findFirst({
      where: { id, teamId: team.id },
    });

    if (!member) {
      return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
    }

    await db.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
