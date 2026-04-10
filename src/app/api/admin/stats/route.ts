import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BotManager } from "@/lib/bot-manager";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !["admin", "developer"].includes((session.user as any).role)) {
            return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
        }

        const stats = await BotManager.getAdminStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
    }
}
