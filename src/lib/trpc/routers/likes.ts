import { SCORE_PER_LIKE } from "@/src/config/const";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { amps } from "../../drizzle/schema";
import { redis } from "../../redis";
import { generateAmpLikesKey } from "../../redis/methods/amp";
import {
    addAmpAnalyticsToCache,
    addAmpRetentionToCache,
} from "../../redis/methods/amp/amp";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAnalyticsAndRetentionForAmp } from "./amp";

export const ampLikesRouter = createTRPCRouter({
    manageLikes: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                userId: z.string(),
                action: z.enum(["like", "unlike"]),
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

            const likesKey = generateAmpLikesKey(ampId);
            const { analytics, analyticsKey, retention, retentionKey } =
                await getAnalyticsAndRetentionForAmp(ampId);

            const pipeline = redis.pipeline();

            switch (action) {
                case "like":
                    {
                        if (analytics)
                            pipeline.hincrby(analyticsKey, "likes", 1);
                        else
                            addAmpAnalyticsToCache({
                                id: ampId,
                                views: 0,
                                likes: 1,
                                comments: 0,
                                reamps: 0,
                                bookmarks: 0,
                            });

                        if (retention)
                            pipeline.hincrby(
                                retentionKey,
                                "score",
                                SCORE_PER_LIKE
                            );
                        else
                            addAmpRetentionToCache({
                                id: ampId,
                                score: SCORE_PER_LIKE,
                                lastRefreshed: Date.now(),
                            });

                        pipeline.sadd(likesKey, userId);
                    }
                    break;

                case "unlike":
                    {
                        if (analytics) {
                            if (analytics.likes > 0)
                                pipeline.hincrby(analyticsKey, "likes", -1);
                        } else
                            addAmpAnalyticsToCache({
                                id: ampId,
                                views: 0,
                                likes: 0,
                                comments: 0,
                                reamps: 0,
                                bookmarks: 0,
                            });

                        if (retention)
                            pipeline.hincrby(
                                retentionKey,
                                "score",
                                -SCORE_PER_LIKE
                            );
                        else
                            addAmpRetentionToCache({
                                id: ampId,
                                score: 0,
                                lastRefreshed: Date.now(),
                            });

                        pipeline.srem(likesKey, userId);
                    }
                    break;
            }

            await pipeline.exec();

            return { id: ampId };
        }),
    getIsUserLikingAmp: protectedProcedure
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

            const likesKey = generateAmpLikesKey(ampId);
            const isUserLikingAmp = await redis.sismember(likesKey, userId);

            return isUserLikingAmp === 1;
        }),
});
