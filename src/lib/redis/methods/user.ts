import { eq } from "drizzle-orm";
import { redis } from "..";
import { db } from "../../drizzle";
import { users } from "../../drizzle/schema";
import { CachedUser, cachedUserSchema } from "../../validation/user";

async function getCachableUser(userId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            details: true,
        },
    });

    if (!user) return null;

    const cachableUser: CachedUser = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
        bio: user.details.bio,
        type: user.details.type,
        category: user.details.category,
        gender: user.details.gender,
        socials: user.details.socials,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        usernameChangedAt: user.details.usernameChangedAt.toISOString(),
    };

    return cachableUser;
}

export async function addUserToCache(user: CachedUser) {
    await redis.set(`user:${user.id}`, JSON.stringify(user));
}

export async function updateUserInCache(user: CachedUser) {
    await redis.set(`user:${user.id}`, JSON.stringify(user));
}

export async function deleteUserFromCache(id: string) {
    await redis.del(`user:${id}`);
}

export async function getUserFromCache(id: string) {
    const cachedUser = await redis.get<CachedUser | null>(`user:${id}`);
    if (!cachedUser) {
        const cachableUser = await getCachableUser(id);
        if (!cachableUser) return null;

        await addUserToCache(cachableUser);
        return cachableUser;
    } else if (!cachedUserSchema.safeParse(cachedUser).success) {
        const cachableUser = await getCachableUser(id);
        if (!cachableUser) return null;

        await updateUserInCache(cachableUser);
        return cachableUser;
    }

    return cachedUser;
}

export async function addUsernameToCache(username: string) {
    await redis.sadd("usernames", username);
}

export async function updateUsernameInCache(
    oldUsername: string,
    newUsername: string
) {
    const pipeline = redis.pipeline();
    pipeline.srem("usernames", oldUsername);
    pipeline.sadd("usernames", newUsername);
    await pipeline.exec();
}

export async function deleteUsernameFromCache(username: string) {
    await redis.srem("usernames", username);
}

export async function checkExistingUsernameInCache(username: string) {
    const existingUsernamesRaw = await redis.smembers<string[][]>("usernames");
    const existingUsernames = existingUsernamesRaw.flatMap(
        (existingUsername) => existingUsername
    );
    return existingUsernames.includes(username);
}
