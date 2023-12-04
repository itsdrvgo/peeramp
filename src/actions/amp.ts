"use server";

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
    const ampId = nanoid();

    await db.insert(amps).values({
        id: ampId,
        creatorId,
        content,
        visibility,
        status,
        publishedAt: status === "published" ? new Date() : null,
    });

    return { id: ampId };
}
