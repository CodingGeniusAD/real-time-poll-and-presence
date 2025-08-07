import { NextResponse } from 'next/server';
import { wsManager } from '@/lib/websocket-server';

export async function GET() {
  try {
    const stats = wsManager.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting WebSocket stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}