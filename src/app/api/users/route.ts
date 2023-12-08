import { env } from "@/env.mjs";
import { db } from "@/src/lib/drizzle";
import { userDetails, users } from "@/src/lib/drizzle/schema";
import {
    addUsernameToCache,
    addUserToCache,
    deleteUserFromCache,
    deleteUsernameFromCache,
    getUserFromCache,
    updateUserInCache,
    updateUsernameInCache,
} from "@/src/lib/redis/methods/user";
import { CResponse, handleError } from "@/src/lib/utils";
import {
    userCreateWebhookSchema,
    userDeleteWebhookSchema,
    userUpdateWebhookSchema,
    WebhookData,
    webhookSchema,
} from "@/src/lib/validation/webhook";
import { SvixHeaders } from "@/src/types";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { Webhook } from "svix";

export async function POST(req: NextRequest) {
    const payload = await req.json();

    const headers: SvixHeaders = {
        "svix-id": req.headers.get("svix-id")!,
        "svix-timestamp": req.headers.get("svix-timestamp")!,
        "svix-signature": req.headers.get("svix-signature")!,
    };

    const wh = new Webhook(env.SVIX_SECRET);
    let body: WebhookData;

    try {
        body = wh.verify(JSON.stringify(payload), headers) as WebhookData;
    } catch (err) {
        return CResponse({ message: "BAD_REQUEST" });
    }

    const { type, data } = webhookSchema.parse(body);

    switch (type) {
        case "user.created": {
            try {
                const {
                    id,
                    email_addresses,
                    first_name: firstName,
                    last_name: lastName,
                    image_url: image,
                    username,
                    primary_email_address_id,
                } = userCreateWebhookSchema.parse(data);

                const email =
                    email_addresses.find(
                        (email) => email.id === primary_email_address_id
                    )?.email_address ?? email_addresses[0].email_address;

                await Promise.all([
                    db.insert(users).values({
                        firstName,
                        lastName,
                        username,
                        id,
                        image,
                        email,
                    }),
                    db.insert(userDetails).values({
                        userId: id,
                        usernameChangedAt: new Date(),
                    }),
                    addUserToCache({
                        id,
                        username,
                        firstName,
                        lastName,
                        image,
                        email,
                        bio: null,
                        type: "normal",
                        category: "none",
                        gender: "none",
                        socials: [],
                        score: "0",
                        isVerified: false,
                        resume: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        usernameChangedAt: new Date().toISOString(),
                    }),
                    addUsernameToCache(username),
                ]);

                return CResponse({ message: "CREATED" });
            } catch (err) {
                return handleError(err);
            }
        }

        case "user.updated": {
            try {
                const {
                    id,
                    email_addresses,
                    image_url: image,
                    first_name: firstName,
                    last_name: lastName,
                    primary_email_address_id,
                    username,
                    public_metadata,
                } = userUpdateWebhookSchema.parse(data);

                const existingUser = await db.query.users.findFirst({
                    where: eq(users.id, id),
                    with: {
                        details: true,
                    },
                });
                if (!existingUser) return CResponse({ message: "NOT_FOUND" });

                const email =
                    email_addresses.find(
                        (email) => email.id === primary_email_address_id
                    )?.email_address ?? email_addresses[0].email_address;

                await Promise.all([
                    db
                        .update(users)
                        .set({
                            firstName,
                            lastName,
                            username,
                            image,
                            email,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.id, existingUser.id)),
                    existingUser.details
                        ? db
                              .update(userDetails)
                              .set({
                                  bio: public_metadata.bio,
                                  type: public_metadata.type,
                                  category: public_metadata.category,
                                  gender: public_metadata.gender,
                                  socials: public_metadata.socials,
                                  isVerified: public_metadata.isVerified,
                                  score: public_metadata.score,
                                  resume: public_metadata.resume,
                                  usernameChangedAt: new Date(
                                      public_metadata.usernameChangedAt
                                  ),
                              })
                              .where(eq(userDetails.userId, existingUser.id))
                        : db.insert(userDetails).values({
                              userId: id,
                              bio: public_metadata.bio,
                              type: public_metadata.type,
                              gender: public_metadata.gender,
                              category: public_metadata.category,
                              socials: public_metadata.socials,
                              score: public_metadata.score,
                              isVerified: public_metadata.isVerified,
                              resume: public_metadata.resume,
                              usernameChangedAt: new Date(
                                  public_metadata.usernameChangedAt
                              ),
                          }),
                    ,
                    updateUserInCache({
                        id,
                        username,
                        firstName,
                        lastName,
                        image,
                        email,
                        bio: public_metadata.bio,
                        type: public_metadata.type,
                        category: public_metadata.category,
                        gender: public_metadata.gender,
                        socials: public_metadata.socials,
                        isVerified: public_metadata.isVerified,
                        score: public_metadata.score,
                        resume: public_metadata.resume,
                        createdAt: existingUser.createdAt.toISOString(),
                        updatedAt: new Date().toISOString(),
                        usernameChangedAt: new Date(
                            public_metadata.usernameChangedAt
                        ).toISOString(),
                    }),
                    manageUsernameChange(id, username, existingUser.username),
                ]);

                return CResponse({ message: "OK" });
            } catch (err) {
                return handleError(err);
            }
        }

        case "user.deleted": {
            try {
                const { id } = userDeleteWebhookSchema.parse(data);

                const existingUser = await getUserFromCache(id);
                if (!existingUser) return CResponse({ message: "NOT_FOUND" });

                await Promise.all([
                    db.delete(users).where(eq(users.id, id)),
                    deleteUserFromCache(id),
                    deleteUsernameFromCache(existingUser.username),
                ]);

                return CResponse({ message: "OK", data: id });
            } catch (err) {
                return handleError(err);
            }
        }

        default: {
            return CResponse({ message: "BAD_REQUEST" });
        }
    }
}

async function manageUsernameChange(
    userId: string,
    username: string,
    prevUsername: string
) {
    await Promise.all([
        db
            .update(userDetails)
            .set({
                usernameChangedAt: new Date(),
            })
            .where(eq(userDetails.userId, userId)),
        updateUsernameInCache(prevUsername, username),
    ]);
}
