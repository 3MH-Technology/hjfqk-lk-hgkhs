import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/team — fetch team members
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Find team owned by this user, or create one if not exists
    let team = await db.team.findFirst({ where: { ownerId: userId } });

    if (!team) {
      team = await db.team.create({
        data: { ownerId: userId, name: "فريقي" },
      });
    }

    const members = await db.teamMember.findMany({
      where: { teamId: team.id, status: "active" },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ team, members });
  } catch (error) {
    console.error("Get team error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// POST /api/team — invite a new member
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { email, name, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const validRoles = ["admin", "developer", "viewer"];
    const memberRole = validRoles.includes(role) ? role : "viewer";

    let team = await db.team.findFirst({ where: { ownerId: userId } });

    if (!team) {
      team = await db.team.create({
        data: { ownerId: userId, name: "فريقي" },
      });
    }

    // Check if member already exists
    const existing = await db.teamMember.findFirst({
      where: { teamId: team.id, email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "هذا العضو موجود بالفعل" }, { status: 409 });
    }

    const member = await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: "",
        email: email.toLowerCase(),
        name: name || null,
        role: memberRole,
        invitedBy: userId,
        status: "pending",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Invite member error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
