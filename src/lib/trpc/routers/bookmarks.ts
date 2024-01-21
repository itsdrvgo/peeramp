import { SCORE_PER_BOOKMARK } from "@/src/config/const";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { amps } from "../../drizzle/schema";
import { redis } from "../../redis";
import { generateAmpBookmarksKey } from "../../redis/methods/amp";
import {
    addAmpAnalyticsToCache,
    addAmpRetentionToCache,
} from "../../redis/methods/amp/amp";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAnalyticsAndRetentionForAmp } from "./amp";

export const ampBookmarksRouter = createTRPCRouter({
    manageBookmarks: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                userId: z.string(),
                action: z.enum(["add", "remove"]),
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
        .mutation(async ({ input, ctx }) => {
            const { ampId, userId, action } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: eq(amps.id, ampId),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            const bookmarksKey = generateAmpBookmarksKey(ampId);
            const { analytics, analyticsKey, retention, retentionKey } =
                await getAnalyticsAndRetentionForAmp(ampId);

            const pipeline = redis.pipeline();

            switch (action) {
                case "add":
                    {
                        if (analytics)
                            pipeline.hincrby(analyticsKey, "bookmarks", 1);
                        else
                            addAmpAnalyticsToCache({
                                id: ampId,
                                bookmarks: 1,
                                comments: 0,
                                likes: 0,
                                reamps: 0,
                                views: 0,
                            });

                        if (retention)
                            pipeline.hincrby(
                                retentionKey,
                                "score",
                                SCORE_PER_BOOKMARK
                            );
                        else
                            addAmpRetentionToCache({
                                id: ampId,
                                score: SCORE_PER_BOOKMARK,
                                lastRefreshed: Date.now(),
                            });

                        pipeline.sadd(bookmarksKey, userId);
                    }
                    break;

                case "remove":
                    {
                        if (analytics)
                            if (analytics.bookmarks > 0)
                                pipeline.hincrby(analyticsKey, "bookmarks", -1);
                            else
                                addAmpAnalyticsToCache({
                                    id: ampId,
                                    bookmarks: 0,
                                    comments: 0,
                                    likes: 0,
                                    reamps: 0,
                                    views: 0,
                                });

                        if (retention)
                            pipeline.hincrby(
                                retentionKey,
                                "score",
                                -SCORE_PER_BOOKMARK
                            );
                        else
                            addAmpRetentionToCache({
                                id: ampId,
                                score: -SCORE_PER_BOOKMARK,
                                lastRefreshed: Date.now(),
                            });

                        pipeline.srem(bookmarksKey, userId);
                    }
                    break;
            }

            await pipeline.exec();

            return { id: ampId };
        }),
    getIsUserBookmarkedAmp: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                userId: z.string(),
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
        .query(async ({ input }) => {
            const { ampId, userId } = input;

            const bookmarksKey = generateAmpBookmarksKey(ampId);
            const isBookmarked = await redis.sismember(bookmarksKey, userId);

            return isBookmarked === 1;
        }),
});
