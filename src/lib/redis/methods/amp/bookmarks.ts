import { generateAmpBookmarksKey } from ".";
import { redis } from "../..";

export async function bookmarkAmp(ampId: string, userId: string) {
    const key = generateAmpBookmarksKey(ampId);

    const pipeline = redis.pipeline();
    pipeline.sadd(key, userId);
    pipeline.scard(key);

    const result = await pipeline.exec();
    const bookmarks = result[1] as number;
    return bookmarks;
}

export async function unbookmarkAmp(ampId: string, userId: string) {
    const key = generateAmpBookmarksKey(ampId);

    const pipeline = redis.pipeline();
    pipeline.srem(key, userId);
    pipeline.scard(key);

    const result = await pipeline.exec();
    const bookmarks = result[1] as number;
    return bookmarks;
}

export async function getAmpBookmarks(ampId: string) {
    const key = generateAmpBookmarksKey(ampId);
    const bookmarks = await redis.scard(key);
    return bookmarks;
}

export async function isAmpBookmarkedByUser(ampId: string, userId: string) {
    const key = generateAmpBookmarksKey(ampId);
    const isBookmarked = await redis.sismember(key, userId);
    return isBookmarked;
}
