/**
 * Health check API route.
 * Pings configured STT and LLM models and the database, returns non-2xx on failure.
 */
import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/health';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const result = await checkHealth(getDatabase());

    const statusCode = result.status === 'healthy' ? 200 : 503;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error during health check',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
