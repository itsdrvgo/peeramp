"use server";

import { clerkClient } from "@clerk/nextjs";
import { nanoid } from "nanoid";
import { db } from "../lib/drizzle";
import { amps } from "../lib/drizzle/schema";
import { Status, Visibility } from "../types";

export async function createAmp({
    content,
    creatorId,
    visibility,
    status,
}: {
    creatorId: string;
    content: string;
    visibility: Visibility;
    status: Status;
}) {
    const user = await clerkClient.users.getUser(creatorId);
    if (!user) throw new Error("User not found");

    const ampId = nanoid();

    await Promise.all([
        db.insert(amps).values({
            id: ampId,
            creatorId,
            content,
            visibility,
            status,
            publishedAt: status === "published" ? new Date() : null,
        }),
        clerkClient.users.updateUserMetadata(creatorId, {
            publicMetadata: {
                ...user.publicMetadata,
                ampCount: user.publicMetadata.ampCount + 1,
            },
        }),
    ]);

    return { id: ampId };
}
