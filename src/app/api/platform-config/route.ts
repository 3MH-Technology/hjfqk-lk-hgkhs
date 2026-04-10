import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const configs = await db.platformConfig.findMany();

    const configMap: Record<string, string> = {};
    for (const config of configs) {
      configMap[config.key] = config.value;
    }

    return NextResponse.json(configMap);
  } catch (error) {
    console.error('Failed to fetch platform config:', error);
    return NextResponse.json({}, { status: 200 });
  }
}
