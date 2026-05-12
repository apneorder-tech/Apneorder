import { Redis } from "@upstash/redis";

/**
 * Standardized Redis Client for Apneorder.
 * Uses Upstash Redis for serverless-optimized caching.
 * @see https://upstash.com/docs/redis/overall/getstarted
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache Key Helpers for consistent naming.
 */
export const CACHE_KEYS = {
  /**
   * Menu cache for a specific restaurant.
   * Includes categories and items.
   * v2 — added prepTimeMinutes to cached payload (bump version on any schema change)
   */
  menu: (restaurantId: string) => `menu_v2:${restaurantId}`,
  
  /**
   * Dashboard statistics cache (optional future use).
   */
  stats: (restaurantId: string) => `stats:${restaurantId}`,
};

/**
 * Standard TTS (Time To Live) constants.
 */
export const CACHE_TTL = {
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
};
