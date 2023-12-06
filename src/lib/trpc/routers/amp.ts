import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { amps } from "../../drizzle/schema";
import { statusSchema, visibilitySchema } from "../../validation/amp";
import { publicMetadataSchema } from "../../validation/user";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const ampRouter = createTRPCRouter({
    createAmp: protectedProcedure
        .input(
            z.object({
                creatorId: z.string(),
                content: z.string(),
                visibility: visibilitySchema,
                status: statusSchema,
                metadata: publicMetadataSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const id = nanoid();

            const { creatorId, content, visibility, status } = input;

            await Promise.all([
                ctx.db.insert(amps).values({
                    id,
                    creatorId,
                    content,
                    visibility,
                    status,
                    publishedAt: status === "published" ? new Date() : null,
                }),
                status === "published" &&
                    clerkClient.users.updateUserMetadata(creatorId, {
                        publicMetadata: {
                            ...input.metadata,
                            ampCount: input.metadata.ampCount + 1,
                        },
                    }),
            ]);

            return { id };
        }),
    editAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
                content: z.string(),
                visibility: visibilitySchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, creatorId, content, visibility } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await ctx.db
                .update(amps)
                .set({
                    content,
                    visibility,
                    updatedAt: new Date(),
                })
                .where(eq(amps.id, ampId));

            return { id: ampId };
        }),
    publishAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
                metadata: publicMetadataSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, creatorId, metadata } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await Promise.all([
                ctx.db
                    .update(amps)
                    .set({
                        status: "published",
                        publishedAt: new Date(),
                    })
                    .where(eq(amps.id, ampId)),
                clerkClient.users.updateUserMetadata(creatorId, {
                    publicMetadata: {
                        ...metadata,
                        ampCount: metadata.ampCount + 1,
                    },
                }),
            ]);

            return { id: ampId };
        }),
    pinAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, creatorId } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            const pinnedAmp = await ctx.db.query.amps.findFirst({
                where: and(
                    eq(amps.creatorId, creatorId),
                    eq(amps.pinned, true)
                ),
            });

            if (pinnedAmp) {
                if (pinnedAmp.id === ampId)
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "Amp is already pinned!",
                    });

                await ctx.db
                    .update(amps)
                    .set({
                        pinned: false,
                    })
                    .where(eq(amps.id, pinnedAmp.id));
            }

            await ctx.db
                .update(amps)
                .set({
                    pinned: true,
                })
                .where(eq(amps.id, ampId));

            return { id: ampId };
        }),
    unpinAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, creatorId } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: and(
                    eq(amps.id, ampId),
                    eq(amps.creatorId, creatorId),
                    eq(amps.pinned, true)
                ),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await ctx.db
                .update(amps)
                .set({
                    pinned: false,
                })
                .where(eq(amps.id, ampId));

            return { id: ampId };
        }),
    deleteAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
                metadata: publicMetadataSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.creatorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, creatorId, metadata } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await Promise.all([
                ctx.db.delete(amps).where(eq(amps.id, ampId)),
                clerkClient.users.updateUserMetadata(creatorId, {
                    publicMetadata: {
                        ...metadata,
                        ampCount: metadata.ampCount - 1,
                    },
                }),
            ]);

            return { id: ampId };
        }),
});
