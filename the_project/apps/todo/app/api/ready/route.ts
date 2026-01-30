import { NextResponse } from 'next/server';

export async function GET() {
  const backend = process.env.TODO_BACKEND_URL;
  if (!backend) {
    return NextResponse.json({ status: 'not ready', reason: 'no backend url' }, { status: 503 });
  }

  try {
    const resp = await fetch(`${backend.replace(/\/$/, '')}/ready`, { method: 'GET' });
    if (resp.ok) return NextResponse.json({ status: 'ready' }, { status: 200 });
    return NextResponse.json({ status: 'not ready' }, { status: 503 });
  } catch (err) {
    console.error('Failed to reach todo-backend for readiness:', err);
    return NextResponse.json({ status: 'not ready' }, { status: 503 });
  }
}
