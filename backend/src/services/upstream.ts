import { env } from '../config/env';
import { Buffer } from 'node:buffer';

function getAuthHeader() {
  const encoded = Buffer.from(env.peamsubKey).toString('base64');
  return { Authorization: `Basic ${encoded}` };
}

export async function callPeamsub<T = any>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${env.peamsubUrl}${path}`, {
    method,
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as any;

  if (!res.ok) throw new Error(json.message || 'Peamsub error');

  // บาง endpoint อาจซ่อน array ไว้ใน data.data หรือ data.items
  const data = Array.isArray(json.data)
    ? json.data
    : Array.isArray(json.data?.data)
      ? json.data.data
      : Array.isArray(json.data?.items)
        ? json.data.items
        : json.data;

  return data as T;
} 