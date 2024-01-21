import { clerkClient } from "@clerk/nextjs";
import { generateCachedUserKey, generateCachedUsernamesKey } from ".";
import { redis } from "../..";
import { CachedUser, cachedUserSchema } from "../../../validation/user";

const usernamesKey = generateCachedUsernamesKey();

async function getCachableUser(userId: string) {
    const user = await clerkClient.users.getUser(userId);
    if (!user) return null;

    const email = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress;
    if (!email) return null;

    const cachableUser: CachedUser = {
        id: user.id,
        username: user.username!,
        firstName: user.firstName!,
        lastName: user.lastName!,
        email,
        image: user.imageUrl,
        bio: user.publicMetadata.bio,
        type: user.publicMetadata.type,
        category: user.publicMetadata.category,
        gender: user.publicMetadata.gender,
        socials: user.publicMetadata.socials,
        isVerified: user.publicMetadata.isVerified,
        education: user.publicMetadata.education,
        resume: user.publicMetadata.resume,
        createdAt: new Date(user.createdAt).toISOString(),
        updatedAt: new Date(user.updatedAt).toISOString(),
        usernameChangedAt: new Date(
            user.publicMetadata.usernameChangedAt
        ).toISOString(),
    };

    return cachableUser;
}

export async function addUserToCache(user: CachedUser) {
    const key = generateCachedUserKey(user.id);
    await redis.set(key, JSON.stringify(user));
}

export async function updateUserInCache(user: CachedUser) {
    const key = generateCachedUserKey(user.id);
    await redis.set(key, JSON.stringify(user));
}

export async function deleteUserFromCache(id: string) {
    const key = generateCachedUserKey(id);
    await redis.del(key);
}

export async function getUserFromCache(id: string) {
    const key = generateCachedUserKey(id);

    const cachedUser = await redis.get<CachedUser | null>(key);
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
    await redis.sadd(usernamesKey, username);
}

export async function updateUsernameInCache(
    oldUsername: string,
    newUsername: string
) {
    const pipeline = redis.pipeline();
    pipeline.srem(usernamesKey, oldUsername);
    pipeline.sadd(usernamesKey, newUsername);
    await pipeline.exec();
}

export async function deleteUsernameFromCache(username: string) {
    await redis.srem(usernamesKey, username);
}

export async function checkExistingUsernameInCache(username: string) {
    const existingUsernamesRaw = await redis.smembers<string[][]>(usernamesKey);
    const existingUsernames = existingUsernamesRaw.flatMap(
        (existingUsername) => existingUsername
    );
    return existingUsernames.includes(username);
}
