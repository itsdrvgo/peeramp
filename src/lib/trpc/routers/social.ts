import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateId } from "../../utils";
import { publicMetadataSchema, userSocialSchema } from "../../validation/user";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userSocialRouter = createTRPCRouter({
    addSocial: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                social: userSocialSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.userId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            if (input.metadata.socials.find((x) => x.url === input.social.url))
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "You already have this social!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input }) => {
            const { userId, metadata, social } = input;

            const newUser = await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    socials: [
                        ...metadata.socials,
                        {
                            ...social,
                            id: generateId(),
                        },
                    ],
                },
            });

            return {
                id: newUser.id,
            };
        }),
    editSocial: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                social: userSocialSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.userId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input }) => {
            const { userId, metadata, social } = input;

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
        }),
    deleteSocial: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                socialId: z.string(),
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.userId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input }) => {
            const { userId, metadata, socialId } = input;

            const newUser = await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    socials: metadata.socials.filter((x) => x.id !== socialId),
                },
            });

            return {
                id: newUser.id,
            };
        }),
});
