/**
 * Rate Limiter (In-memory, per-IP)
 * For Vercel Serverless: uses in-memory Map (resets when function cold-starts)
 * For production scale: replace with Redis/Upstash
 * 
 * NOTE: Mobile networks use carrier-grade NAT, meaning many users share
 * the same IP. Keep the limit generous to avoid blocking legitimate orders.
 */
const rateLimitMap = new Map();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 30; // max 30 orders per 10 min per IP (generous for shared IPs)

export function rateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries periodically
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
