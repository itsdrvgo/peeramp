import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicMetadataSchema, userEditSchema } from "../../validation/user";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userEducationRouter } from "./education";
import { userSocialRouter } from "./social";

export const userRouter = createTRPCRouter({
    updateUserMetadata: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
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
            const { userId, metadata } = input;

            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: metadata,
            });

            return { id: userId };
        }),
    updateUser: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
                ...userEditSchema.shape,
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
            const {
                userId,
                metadata,
                bio,
                category,
                gender,
                firstName,
                lastName,
            } = input;

            await clerkClient.users.updateUser(userId, {
                firstName,
                lastName,
                publicMetadata: {
                    ...metadata,
                    bio,
                    category,
                    gender,
                },
            });

            return { id: userId };
        }),
    deleteResume: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                metadata: publicMetadataSchema,
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
            const { userId, metadata } = input;

            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    ...metadata,
                    resume: {
                        key: "",
                        name: "",
                        size: 0,
                        url: "",
                    },
                },
            });

            return { id: userId };
        }),
    deleteUser: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                password: z.string(),
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
            const { userId, password } = input;

            const { verified } = await clerkClient.users.verifyPassword({
                userId,
                password,
            });

            if (!verified) throw new Error("Incorrect password!");
            await clerkClient.users.deleteUser(userId);

            return { id: userId };
        }),
    social: userSocialRouter,
    education: userEducationRouter,
});
