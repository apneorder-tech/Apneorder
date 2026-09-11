import { redis } from "./redis-new";

// In-memory sliding window cache for instant 0ms responses
const localRateLimits = new Map<string, { count: number; expiresAt: number }>();

/**
 * Ultra-fast Rate Limiter with Local Memory + Redis Sync
 * @param identifier - Unique ID for the requester (e.g., IP address)
 * @param limit - Max number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function ratelimit(
    identifier: string, 
    limit: number = 5, 
    windowSeconds: number = 60
) {
    // 🚀 Bypass for local development / localhost to ensure instant <1ms development speed
    if (
        identifier === "127.0.0.1" || 
        identifier === "::1" || 
        identifier === "localhost" ||
        process.env.NODE_ENV !== "production"
    ) {
        return {
            success: true,
            limit,
            remaining: limit,
            reset: 0
        };
    }

    const now = Date.now();
    const entry = localRateLimits.get(identifier);

    if (entry && entry.expiresAt > now) {
        entry.count += 1;
        if (entry.count > limit) {
            return {
                success: false,
                limit,
                remaining: 0,
                reset: Math.ceil((entry.expiresAt - now) / 1000)
            };
        }
        return {
            success: true,
            limit,
            remaining: Math.max(0, limit - entry.count),
            reset: Math.ceil((entry.expiresAt - now) / 1000)
        };
    }

    // New window in memory
    localRateLimits.set(identifier, {
        count: 1,
        expiresAt: now + windowSeconds * 1000
    });

    // Clean up memory if cache grows
    if (localRateLimits.size > 2000) {
        for (const [k, v] of localRateLimits.entries()) {
            if (v.expiresAt <= now) localRateLimits.delete(k);
        }
    }

    // Async Redis sync with 200ms timeout safety
    try {
        const key = `ratelimit:${identifier}`;
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 200));
        const redisPromise = redis.pipeline()
            .incr(key)
            .expire(key, windowSeconds, "NX")
            .exec();
        
        await Promise.race([redisPromise, timeoutPromise]).catch(() => {});
    } catch {}

    return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: windowSeconds
    };
}

