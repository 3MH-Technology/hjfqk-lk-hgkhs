import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

function generateApiKey(): string {
  const chars = "0123456789abcdef";
  const random = Array.from({ length: 32 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `wolf_${random}`;
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const keys = await db.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const keysWithStatus = keys.map((key) => {
      const isExpired = key.expiresAt && new Date(key.expiresAt) < now;
      return {
        ...key,
        status: isExpired ? "expired" : "active",
      };
    });

    return NextResponse.json(keysWithStatus);
  } catch (error) {
    console.error("Get API keys error:", error);
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
      return NextResponse.json({ error: "اسم المفتاح مطلوب" }, { status: 400 });
    }

    const validPermissions = ["read", "write", "admin"];
    const permissions = validPermissions.includes(body.permissions)
      ? body.permissions
      : "read";

    const fullKey = generateApiKey();
    const keyHash = hashKey(fullKey);
    const keyPrefix = `${fullKey.slice(0, 12)}...${fullKey.slice(-4)}`;

    let expiresAt: Date | null = null;
    if (body.expiresAt) {
      const days = parseInt(body.expiresAt);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }

    const apiKey = await db.apiKey.create({
      data: {
        userId,
        name: body.name.trim(),
        key: keyHash,
        keyPrefix,
        permissions,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        key: fullKey,
        keyPrefix,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create API key error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
