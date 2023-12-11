import { TRPCError } from "@trpc/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { nanoid } from "nanoid";
import { z } from "zod";
import { amps } from "../../drizzle/schema";
import {
    ampMetadataSchema,
    statusSchema,
    visibilitySchema,
} from "../../validation/amp";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const ampRouter = createTRPCRouter({
    getPinnedAmp: publicProcedure
        .input(
            z.object({
                creatorId: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { creatorId } = input;

            const data = await ctx.db.query.amps.findFirst({
                where: and(
                    eq(amps.creatorId, creatorId),
                    eq(amps.pinned, true)
                ),
            });

            return data;
        }),
    getInfiniteAmps: publicProcedure
        .input(
            z.object({
                creatorId: z.string(),
                cursor: z.string().nullish(),
                limit: z.number().min(1).max(100).default(10),
                type: z
                    .enum(["published", "draft", "all"])
                    .default("published"),
            })
        )
        .query(async ({ input, ctx }) => {
            const { creatorId, cursor, limit, type } = input;

            switch (type) {
                case "published": {
                    const data = await ctx.db.query.amps.findMany(
                        withCursorPagination({
                            limit,
                            where: and(
                                eq(amps.creatorId, creatorId),
                                eq(amps.status, "published"),
                                ne(amps.pinned, true)
                            ),
                            cursors: [
                                [
                                    amps.publishedAt,
                                    "desc",
                                    cursor ? new Date(cursor) : undefined,
                                ],
                            ],
                        })
                    );

                    return {
                        data,
                        nextCursor: data.length
                            ? data[data.length - 1].publishedAt!.toISOString()
                            : null,
                    };
                }

                case "draft": {
                    const data = await ctx.db.query.amps.findMany(
                        withCursorPagination({
                            limit,
                            where: and(
                                eq(amps.creatorId, creatorId),
                                eq(amps.status, "draft")
                            ),
                            cursors: [
                                [
                                    amps.createdAt,
                                    "desc",
                                    cursor ? new Date(cursor) : undefined,
                                ],
                            ],
                        })
                    );

                    return {
                        data,
                        nextCursor: data.length
                            ? data[data.length - 1].createdAt.toISOString()
                            : null,
                    };
                }

                default: {
                    const data = await ctx.db.query.amps.findMany(
                        withCursorPagination({
                            limit,
                            where: eq(amps.creatorId, creatorId),
                            cursors: [
                                [
                                    amps.createdAt,
                                    "desc",
                                    cursor ? new Date(cursor) : undefined,
                                ],
                            ],
                        })
                    );

                    return {
                        data,
                        nextCursor: data.length
                            ? data[data.length - 1].createdAt.toISOString()
                            : null,
                    };
                }
            }
        }),
    getAmpCount: publicProcedure
        .input(
            z.object({
                creatorId: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const data = await ctx.db
                .select({
                    count: sql`COUNT(*)`,
                })
                .from(amps)
                .where(
                    and(
                        eq(amps.creatorId, input.creatorId),
                        eq(amps.status, "published")
                    )
                );

            return Number(data[0].count);
        }),
    createAmp: protectedProcedure
        .input(
            z.object({
                creatorId: z.string(),
                content: z.string(),
                visibility: visibilitySchema,
                status: statusSchema,
                metadata: ampMetadataSchema,
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

            const { creatorId, content, visibility, status, metadata } = input;

            await ctx.db.insert(amps).values({
                id,
                creatorId,
                content,
                visibility,
                status,
                publishedAt: status === "published" ? new Date() : null,
                metadata,
            });

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

            await ctx.db
                .update(amps)
                .set({
                    status: "published",
                    publishedAt: new Date(),
                })
                .where(eq(amps.id, ampId));

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

            await ctx.db.delete(amps).where(eq(amps.id, ampId));

            return { id: ampId };
        }),
});
