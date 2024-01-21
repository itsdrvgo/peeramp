import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateId } from "../../utils";
import {
    publicMetadataSchema,
    userEducationSchema,
} from "../../validation/user";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userEducationRouter = createTRPCRouter({
    addEduction: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                education: userEducationSchema,
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
            const { userId, metadata, education } = input;

            const newUser = await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    education: [
                        ...metadata.education,
                        {
                            ...education,
                            id: generateId(),
                        },
                    ],
                },
            });

            return {
                id: newUser.id,
            };
        }),
    editEducation: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                education: userEducationSchema,
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
            const { userId, metadata, education } = input;

            const newUser = await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    education: metadata.education.map((x) =>
                        x.id === education.id
                            ? {
                                  ...education,
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
    deleteEducation: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                educationId: z.string(),
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
            const { userId, metadata, educationId } = input;

            const newUser = await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    education: metadata.education.filter(
                        (x) => x.id !== educationId
                    ),
                },
            });

            return {
                id: newUser.id,
            };
        }),
});
