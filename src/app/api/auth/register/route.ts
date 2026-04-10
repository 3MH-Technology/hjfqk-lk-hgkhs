import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    // Check existing email
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
    }

    // One account per IP restriction
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    if (ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      const existingIp = await db.user.findFirst({ where: { ipAddress: ip } });
      if (existingIp) {
        return NextResponse.json({ error: "لا يمكنك إنشاء أكثر من حساب واحد من هذا الجهاز" }, { status: 403 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name: name || null,
        ipAddress: ip,
        plan: "free",
        maxBots: 2,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
