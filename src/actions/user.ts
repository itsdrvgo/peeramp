"use server";

import { clerkClient } from "@clerk/nextjs";
import { nanoid } from "nanoid";
import { UserEditData } from "../components/forms/profile-update-form";
import { UserSocial } from "../lib/validation/user";

export async function updateUser(userId: string, updates: UserEditData) {
    const user = await clerkClient.users.getUser(userId);
    if (!user) throw new Error("User not found!");

    const newUser = await clerkClient.users.updateUser(userId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        publicMetadata: {
            ...user.publicMetadata,
            ...updates,
        },
    });

    return {
        id: newUser.id,
    };
}

export async function updateEmail({
    userId,
    emailAddress,
}: {
    userId: string;
    emailAddress: string;
}) {
    const user = await clerkClient.users.getUser(userId);
    if (!user) throw new Error("User not found!");

    const oldEmailId = user.primaryEmailAddressId;
    if (!oldEmailId) throw new Error("User does not have an email address!");

    const newEmail = await clerkClient.emailAddresses.createEmailAddress({
        userId,
        emailAddress,
        primary: true,
        verified: true,
    });

    await clerkClient.emailAddresses.deleteEmailAddress(oldEmailId);

    return { newEmail };
}

export async function updatePassword({
    userId,
    password,
}: {
    userId: string;
    password: string;
}) {
    const user = await clerkClient.users.updateUser(userId, {
        password,
    });

    return {
        id: user.id,
    };
}

export async function deleteUser({
    userId,
    password,
}: {
    userId: string;
    password: string;
}) {
    const { verified } = await clerkClient.users.verifyPassword({
        userId,
        password,
    });

    if (!verified) throw new Error("Incorrect password!");
    await clerkClient.users.deleteUser(userId);

    return {
        id: userId,
    };
}

export async function addSocialToUser({
    userId,
    metadata,
    social,
}: {
    userId: string;
    metadata: UserPublicMetadata;
    social: UserSocial;
}) {
    const newUser = await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            ...metadata,
            socials: [
                ...metadata.socials,
                {
                    ...social,
                    id: nanoid(),
                },
            ],
        },
    });

    return {
        id: newUser.id,
    };
}

export async function editSocialForUser({
    userId,
    metadata,
    social,
}: {
    userId: string;
    metadata: UserPublicMetadata;
    social: UserSocial;
}) {
    const newUser = await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            ...metadata,
            socials: metadata.socials.map((x) =>
                x.id === social.id
                    ? {
                          ...social,
                          id: x.id,
                      }
                    : x
            ),
        },
    });

    return {
        id: newUser.id,
    };
}

export async function deleteSocialForUser({
    userId,
    metadata,
    socialId,
}: {
    userId: string;
    metadata: UserPublicMetadata;
    socialId: string;
}) {
    const newUser = await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            ...metadata,
            socials: metadata.socials.filter((x) => x.id !== socialId),
        },
    });

    return {
        id: newUser.id,
    };
}
