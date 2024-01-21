import {
    generateCachedAmpAnalyticsKey,
    generateCachedAmpRetentionKey,
} from ".";
import { redis } from "../..";
import {
    CachedAmpAnalytics,
    CachedAmpRetention,
} from "../../../validation/amp";

export async function getAmpAnalyticsFromCache(ampId: string) {
    const key = generateCachedAmpAnalyticsKey(ampId);
    const cachedAmpAnalytics = await redis.hgetall<CachedAmpAnalytics>(key);
    return cachedAmpAnalytics;
}

export async function addAmpAnalyticsToCache(analytics: CachedAmpAnalytics) {
    const key = generateCachedAmpAnalyticsKey(analytics.id);
    await redis.hmset(key, analytics);
}

export async function updateAmpAnalyticsInCache(analytics: CachedAmpAnalytics) {
    const key = generateCachedAmpAnalyticsKey(analytics.id);

    const pipeline = redis.pipeline();
    pipeline.hmset(key, analytics);
    await pipeline.exec();
}

export async function deleteAmpAnalyticsFromCache(ampId: string) {
    const key = generateCachedAmpAnalyticsKey(ampId);
    await redis.del(key);
}

export async function getAmpRetentionFromCache(ampId: string) {
    const key = generateCachedAmpRetentionKey(ampId);
    const cachedAmpRetention = await redis.hgetall<CachedAmpRetention>(key);
    return cachedAmpRetention;
}

export async function addAmpRetentionToCache(retention: CachedAmpRetention) {
    const key = generateCachedAmpRetentionKey(retention.id);
    await redis.hmset(key, retention);
    await redis.expire(key, 60 * 60);
}

export async function updateAmpRetentionInCache(retention: CachedAmpRetention) {
    const key = generateCachedAmpRetentionKey(retention.id);

    const pipeline = redis.pipeline();
    pipeline.hmset(key, retention);
    await pipeline.exec();
}

export async function deleteAmpRetentionFromCache(ampId: string) {
    const key = generateCachedAmpRetentionKey(ampId);
    await redis.del(key);
}
