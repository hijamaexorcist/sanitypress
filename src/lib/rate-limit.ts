import 'server-only'

type Bucket = {
	hits: number[]
}

const buckets = new Map<string, Bucket>()

const MINUTE_LIMIT = 8
const HOUR_LIMIT = 40
const MINUTE_MS = 60 * 1000
const HOUR_MS = 60 * MINUTE_MS

export type RateLimitResult =
	| { ok: true; retryAfterSec?: undefined }
	| { ok: false; retryAfterSec: number }

/**
 * Best-effort in-memory IP rate limiter for API routes.
 * On serverless this is per-instance — swap for Redis when traffic grows.
 */
export function checkRate(
	ip: string,
	{
		minuteLimit = MINUTE_LIMIT,
		hourLimit = HOUR_LIMIT,
	}: { minuteLimit?: number; hourLimit?: number } = {},
): RateLimitResult {
	const now = Date.now()
	const bucket = buckets.get(ip) ?? { hits: [] }

	bucket.hits = bucket.hits.filter((t) => now - t < HOUR_MS)

	const inLastMinute = bucket.hits.filter((t) => now - t < MINUTE_MS).length
	if (inLastMinute >= minuteLimit) {
		const oldestInMinute = bucket.hits.find((t) => now - t < MINUTE_MS)!
		return {
			ok: false,
			retryAfterSec: Math.ceil((MINUTE_MS - (now - oldestInMinute)) / 1000),
		}
	}

	if (bucket.hits.length >= hourLimit) {
		const oldest = bucket.hits[0]!
		return {
			ok: false,
			retryAfterSec: Math.ceil((HOUR_MS - (now - oldest)) / 1000),
		}
	}

	bucket.hits.push(now)
	buckets.set(ip, bucket)
	return { ok: true }
}

export function getClientIp(req: Request): string {
	const fwd = req.headers.get('x-forwarded-for')
	if (fwd) return fwd.split(',')[0]!.trim()
	return req.headers.get('x-real-ip') ?? 'unknown'
}
