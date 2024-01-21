import { TRPCError } from "@trpc/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { withCursorPagination } from "drizzle-pagination";
import { z } from "zod";
import { redis } from "../../redis";
import {
    generateAmpBookmarksKey,
    generateAmpLikesKey,
    generateCachedAmpAnalyticsKey,
    generateCachedAmpRetentionKey,
} from "../../redis/methods/amp";
import {
    ampAttachmentSchema,
    ampMetadataSchema,
    AmpWithAnalytics,
    CachedAmpAnalytics,
    CachedAmpRetention,
    statusSchema,
    visibilitySchema,
} from "../../validation/amp";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { ampBookmarksRouter } from "./bookmarks";
import { ampCommentsRouter } from "./comment";
import { ampLikesRouter } from "./likes";

export const ampRouter = createTRPCRouter({
    getPinnedAmp: publicProcedure
        .input(
            z.object({
                creatorId: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { creatorId } = input;
            const { db, amps } = ctx;

            const data = await db.query.amps.findFirst({
                where: and(
                    eq(amps.creatorId, creatorId),
                    eq(amps.pinned, true)
                ),
            });

            if (!data) return null;

            const pipeline = redis.pipeline();

            pipeline.hgetall(generateCachedAmpAnalyticsKey(data.id));
            pipeline.sismember(
                generateAmpLikesKey(data.id),
                ctx.auth?.userId ?? ""
            );
            pipeline.sismember(
                generateAmpBookmarksKey(data.id),
                ctx.auth?.userId ?? ""
            );

            const results: Array<CachedAmpAnalytics | null | 0 | 1> =
                await pipeline.exec();

            const analytics = results[0] as CachedAmpAnalytics | null;
            const isLiked = results[1] as 0 | 1;
            const isBookmarked = results[2] as 0 | 1;

            return {
                ...data,
                views: analytics ? +analytics.views : 0,
                likes: analytics ? +analytics.likes : 0,
                comments: analytics ? +analytics.comments : 0,
                reamps: analytics ? +analytics.reamps : 0,
                bookmarks: analytics ? +analytics.bookmarks : 0,
                isLiked: isLiked === 1,
                isBookmarked: isBookmarked === 1,
            };
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
            const { db, amps } = ctx;

            switch (type) {
                case "published": {
                    const dataWithAnalytics: AmpWithAnalytics[] = [];

                    const data = await db.query.amps.findMany(
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

                    const pipeline = redis.pipeline();

                    for (let i = 0; i < data.length; i++) {
                        const amp = data[i];

                        const analyticsKey = generateCachedAmpAnalyticsKey(
                            amp.id
                        );
                        const bookmarksKey = generateAmpBookmarksKey(amp.id);
                        const likedByUserKey = generateAmpLikesKey(amp.id);

                        pipeline.hgetall(analyticsKey);
                        pipeline.sismember(
                            likedByUserKey,
                            ctx.auth?.userId ?? ""
                        );
                        pipeline.sismember(
                            bookmarksKey,
                            ctx.auth?.userId ?? ""
                        );
                    }

                    const results: Array<CachedAmpAnalytics | null | 0 | 1> =
                        await pipeline.exec();

                    const analytics: (CachedAmpAnalytics | null)[] = [];
                    const likedByUser: (0 | 1)[] = [];
                    const bookmarkedByUser: (0 | 1)[] = [];

                    for (let i = 0; i < results.length; i += 3) {
                        const analyticsResult = results[
                            i
                        ] as CachedAmpAnalytics | null;
                        const likedByUserResult = results[i + 1] as 0 | 1;
                        const bookmarkedByUserResult = results[i + 2] as 0 | 1;

                        analytics.push(
                            analyticsResult
                                ? {
                                      ...analyticsResult,
                                      views: +analyticsResult.views,
                                      likes: +analyticsResult.likes,
                                      comments: +analyticsResult.comments,
                                      reamps: +analyticsResult.reamps,
                                      bookmarks: +analyticsResult.bookmarks,
                                  }
                                : null
                        );
                        likedByUser.push(likedByUserResult);
                        bookmarkedByUser.push(bookmarkedByUserResult);
                    }

                    for (let i = 0; i < data.length; i++) {
                        const amp = data[i];

                        dataWithAnalytics.push({
                            ...amp,
                            views: analytics[i]?.views ?? 0,
                            likes: analytics[i]?.likes ?? 0,
                            comments: analytics[i]?.comments ?? 0,
                            reamps: analytics[i]?.reamps ?? 0,
                            bookmarks: analytics[i]?.bookmarks ?? 0,
                            isLiked: likedByUser[i] === 1,
                            isBookmarked: bookmarkedByUser[i] === 1,
                        });
                    }

                    return {
                        data: dataWithAnalytics,
                        nextCursor: dataWithAnalytics.length
                            ? dataWithAnalytics[
                                  dataWithAnalytics.length - 1
                              ].publishedAt!.toISOString()
                            : null,
                    };
                }

                case "draft": {
                    const dataWithAnalytics: AmpWithAnalytics[] = [];

                    const data = await db.query.amps.findMany(
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

                    for (let i = 0; i < data.length; i++) {
                        const amp = data[i];

                        dataWithAnalytics.push({
                            ...amp,
                            views: 0,
                            likes: 0,
                            comments: 0,
                            reamps: 0,
                            bookmarks: 0,
                            isLiked: false,
                            isBookmarked: false,
                        });
                    }

                    return {
                        data: dataWithAnalytics,
                        nextCursor: dataWithAnalytics.length
                            ? dataWithAnalytics[
                                  dataWithAnalytics.length - 1
                              ].createdAt.toISOString()
                            : null,
                    };
                }

                default: {
                    const dataWithAnalytics: AmpWithAnalytics[] = [];

                    const data = await db.query.amps.findMany(
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

                    const pipeline = redis.pipeline();

                    for (let i = 0; i < data.length; i++) {
                        const amp = data[i];

                        const analyticsKey = generateCachedAmpAnalyticsKey(
                            amp.id
                        );
                        const bookmarksKey = generateAmpBookmarksKey(amp.id);
                        const likedByUserKey = generateAmpLikesKey(amp.id);

                        pipeline.hgetall(analyticsKey);
                        pipeline.sismember(
                            likedByUserKey,
                            ctx.auth?.userId ?? ""
                        );
                        pipeline.sismember(
                            bookmarksKey,
                            ctx.auth?.userId ?? ""
                        );
                    }

                    const results: Array<CachedAmpAnalytics | null | 0 | 1> =
                        await pipeline.exec();

                    const analytics: (CachedAmpAnalytics | null)[] = [];
                    const likedByUser: (0 | 1)[] = [];

                    for (let i = 0; i < results.length; i += 2) {
                        const analyticsResult = results[
                            i
                        ] as CachedAmpAnalytics | null;
                        const likedByUserResult = results[i + 1] as 0 | 1;

                        analytics.push(
                            analyticsResult
                                ? {
                                      ...analyticsResult,
                                      views: +analyticsResult.views,
                                      likes: +analyticsResult.likes,
                                      comments: +analyticsResult.comments,
                                      reamps: +analyticsResult.reamps,
                                      bookmarks: +analyticsResult.bookmarks,
                                  }
                                : null
                        );
                        likedByUser.push(likedByUserResult);
                    }

                    for (let i = 0; i < data.length; i++) {
                        const amp = data[i];

                        dataWithAnalytics.push({
                            ...amp,
                            views: analytics[i]?.views ?? 0,
                            likes: analytics[i]?.likes ?? 0,
                            comments: analytics[i]?.comments ?? 0,
                            reamps: analytics[i]?.reamps ?? 0,
                            bookmarks: analytics[i]?.bookmarks ?? 0,
                            isLiked: likedByUser[i] === 1,
                            isBookmarked: false,
                        });
                    }

                    return {
                        data: dataWithAnalytics,
                        nextCursor: dataWithAnalytics.length
                            ? dataWithAnalytics[
                                  dataWithAnalytics.length - 1
                              ].createdAt.toISOString()
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
            const { creatorId } = input;
            const { db, amps } = ctx;

            const data = await db
                .select({
                    count: sql`COUNT(*)`,
                })
                .from(amps)
                .where(
                    and(
                        eq(amps.creatorId, creatorId),
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
                attachments: z.array(ampAttachmentSchema).nullable(),
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
            const {
                creatorId,
                content,
                visibility,
                status,
                metadata,
                attachments,
            } = input;
            const { db, amps } = ctx;

            const insertedAmp = await db
                .insert(amps)
                .values({
                    creatorId,
                    content,
                    visibility,
                    status,
                    publishedAt: status === "published" ? new Date() : null,
                    metadata,
                    attachments,
                })
                .returning({
                    id: ctx.amps.id,
                });

            return { id: insertedAmp[0].id };
        }),
    editAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                creatorId: z.string(),
                content: z.string(),
                visibility: visibilitySchema,
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
            const { ampId, creatorId, content, visibility, metadata } = input;
            const { db, amps } = ctx;

            const amp = await db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await db
                .update(amps)
                .set({
                    content,
                    visibility,
                    metadata,
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
            const { db, amps } = ctx;

            const amp = await db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await db
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
            const { db, amps } = ctx;

            const amp = await db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            const pinnedAmp = await db.query.amps.findFirst({
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

                await db
                    .update(amps)
                    .set({
                        pinned: false,
                    })
                    .where(eq(amps.id, pinnedAmp.id));
            }

            await db
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
            const { db, amps } = ctx;

            const amp = await db.query.amps.findFirst({
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

            await db
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
            const { db, amps } = ctx;

            const amp = await db.query.amps.findFirst({
                where: and(eq(amps.id, ampId), eq(amps.creatorId, creatorId)),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            await db.delete(amps).where(eq(amps.id, ampId));

            return { id: ampId };
        }),

    likes: ampLikesRouter,
    bookmarks: ampBookmarksRouter,
    comments: ampCommentsRouter,
});

export async function getAnalyticsAndRetentionForAmp(ampId: string) {
    const analyticsKey = generateCachedAmpAnalyticsKey(ampId);
    const retentionKey = generateCachedAmpRetentionKey(ampId);

    const pipeline = redis.pipeline();

    pipeline.hgetall(analyticsKey);
    pipeline.hgetall(retentionKey);

    const [analytics, retention] =
        await pipeline.exec<
            [CachedAmpAnalytics | null, CachedAmpRetention | null]
        >();

    return {
        analytics,
        retention,
        analyticsKey,
        retentionKey,
    };
}
