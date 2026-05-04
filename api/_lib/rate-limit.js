/**
 * Rate Limiter (In-memory, per-IP)
 * For Vercel Serverless: uses in-memory Map (resets when function cold-starts)
 * For production scale: replace with Redis/Upstash
 */
const rateLimitMap = new Map();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // max 5 orders per 10 min per IP

export function rateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap) {
      if (val.windowStart < windowStart) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record || record.windowStart < windowStart) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}
