import { generateAmpLikesKey } from ".";
import { redis } from "../..";

export async function likeAmp(ampId: string, userId: string) {
    const key = generateAmpLikesKey(ampId);

    const pipeline = redis.pipeline();
    pipeline.sadd(key, userId);
    pipeline.scard(key);

    const result = await pipeline.exec();
    const likes = result[1] as number;
    return likes;
}

export async function unlikeAmp(ampId: string, userId: string) {
    const key = generateAmpLikesKey(ampId);

    const pipeline = redis.pipeline();
    pipeline.srem(key, userId);
    pipeline.scard(key);

    const result = await pipeline.exec();
    const likes = result[1] as number;
    return likes;
}

export async function getAmpLikes(ampId: string) {
    const key = generateAmpLikesKey(ampId);
    const likes = await redis.scard(key);
    return likes;
}

export async function isAmpLikedByUser(ampId: string, userId: string) {
    const key = generateAmpLikesKey(ampId);
    const isLiked = await redis.sismember(key, userId);
    return isLiked;
}
