import { redis } from "./redis-new";

/**
 * Simple Redis-backed Rate Limiter
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
    const key = `ratelimit:${identifier}`;
    
    // Multi/Pipeline to ensure atomic operations
    const [current] = await redis.pipeline()
        .incr(key)
        .expire(key, windowSeconds, "NX") // Only set expiry if it doesn't exist
        .exec() as [number, number];

    return {
        success: current <= limit,
        limit,
        remaining: Math.max(0, limit - current),
        reset: windowSeconds // Approximated
    };
}
