import { env } from "@/env.mjs";
import { db } from "@/src/lib/drizzle";
import { users } from "@/src/lib/drizzle/schema";
import {
    addUsernameToCache,
    addUserToCache,
    deleteUserFromCache,
    deleteUsernameFromCache,
    getUserFromCache,
    updateUserInCache,
    updateUsernameInCache,
} from "@/src/lib/redis/methods/user";
import { handleError } from "@/src/lib/utils";
import {
    userDeleteWebhookSchema,
    userWebhookSchema,
    WebhookData,
    webhookSchema,
} from "@/src/lib/validation/webhook";
import { SvixHeaders } from "@/src/types";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
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
        return NextResponse.json({
            code: 400,
            message: "Bad Request!",
        });
    }

    const { type, data } = webhookSchema.parse(body);

    switch (type) {
        case "user.created": {
            try {
                const {
                    id,
                    email_addresses,
                    first_name: firstName,
                    image_url: image,
                    last_name: lastName,
                    username,
                } = userWebhookSchema.parse(data);

                await Promise.all([
                    db.insert(users).values({
                        firstName,
                        lastName,
                        username,
                        id,
                        image,
                        email: email_addresses[0].email_address,
                    }),
                    addUserToCache({
                        id,
                        username,
                        firstName,
                        lastName,
                        image,
                        email: email_addresses[0].email_address,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }),
                    addUsernameToCache(username),
                ]);

                return NextResponse.json({
                    code: 201,
                    message: "Ok",
                });
            } catch (err) {
                return handleError(err);
            }
        }

        case "user.updated": {
            const {
                id,
                email_addresses,
                image_url: image,
                first_name: firstName,
                last_name: lastName,
                username,
            } = userWebhookSchema.parse(data);

            const existingUser = await getUserFromCache(id);
            if (!existingUser)
                return NextResponse.json({
                    code: 404,
                    message: "Account doesn't exist!",
                });

            await Promise.all([
                db
                    .update(users)
                    .set({
                        email:
                            email_addresses[0].email_address ??
                            existingUser.email,
                        username: username ?? existingUser.username,
                        image: image ?? existingUser.image,
                    })
                    .where(eq(users.id, existingUser.id)),
                updateUserInCache({
                    id,
                    username: username ?? existingUser.username,
                    firstName: firstName ?? existingUser.firstName,
                    lastName: lastName ?? existingUser.lastName,
                    image: image ?? existingUser.image,
                    email:
                        email_addresses[0].email_address ?? existingUser.email,
                    createdAt: existingUser.createdAt,
                    updatedAt: new Date().toISOString(),
                }),
                username !== existingUser.username &&
                    updateUsernameInCache(existingUser.username, username),
            ]);

            return NextResponse.json({
                code: 200,
                message: "Ok",
            });
        }

        case "user.deleted": {
            const { id } = userDeleteWebhookSchema.parse(data);

            const existingUser = await getUserFromCache(id);
            if (!existingUser)
                return NextResponse.json({
                    code: 404,
                    message: "Account doesn't exist!",
                });

            await Promise.all([
                db.delete(users).where(eq(users.id, id)),
                deleteUserFromCache(id),
                deleteUsernameFromCache(existingUser.username),
            ]);

            return NextResponse.json({
                code: 200,
                message: "Ok",
                data: JSON.stringify(id),
            });
        }

        default: {
            return NextResponse.json({
                code: 400,
                message: "Bad Request!",
            });
        }
    }
}
