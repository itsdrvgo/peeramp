import { SCORE_PER_COMMENT } from "@/src/config/const";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { amps, comments } from "../../drizzle/schema";
import { redis } from "../../redis";
import {
    addAmpAnalyticsToCache,
    addAmpRetentionToCache,
} from "../../redis/methods/amp/amp";
import { ampAttachmentSchema, ampMetadataSchema } from "../../validation/amp";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAnalyticsAndRetentionForAmp } from "./amp";

export const ampCommentsRouter = createTRPCRouter({
    addComment: protectedProcedure
        .input(
            z.object({
                ampId: z.string(),
                authorId: z.string(),
                content: z.string(),
                attachments: z.array(ampAttachmentSchema).nullable(),
                metadata: ampMetadataSchema,
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.authorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { ampId, authorId, content, attachments, metadata } = input;

            const amp = await ctx.db.query.amps.findFirst({
                where: eq(amps.id, ampId),
            });

            if (!amp)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Amp not found!",
                });

            const { analytics, analyticsKey, retention, retentionKey } =
                await getAnalyticsAndRetentionForAmp(ampId);

            const pipeline = redis.pipeline();

            if (analytics) pipeline.hincrby(analyticsKey, "comments", 1);
            else
                addAmpAnalyticsToCache({
                    id: ampId,
                    views: 0,
                    likes: 0,
                    comments: 1,
                    reamps: 0,
                    bookmarks: 0,
                });

            if (retention)
                pipeline.hincrby(retentionKey, "score", SCORE_PER_COMMENT);
            else
                addAmpRetentionToCache({
                    id: ampId,
                    score: SCORE_PER_COMMENT,
                    lastRefreshed: Date.now(),
                });

            await Promise.all([
                ctx.db.insert(comments).values({
                    ampId,
                    authorId,
                    content,
                    attachments,
                    metadata,
                    parentId: null,
                }),
                pipeline.exec(),
            ]);
        }),
    deleteComment: protectedProcedure
        .input(
            z.object({
                commentId: z.string(),
                authorId: z.string(),
            })
        )
        .use(({ input, ctx, next }) => {
            if (ctx.auth.userId !== input.authorId)
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You're not authorized!",
                });

            return next({
                ctx,
            });
        })
        .mutation(async ({ input, ctx }) => {
            const { commentId, authorId } = input;

            const comment = await ctx.db.query.comments.findFirst({
                where: and(
                    eq(comments.id, commentId),
                    eq(comments.authorId, authorId)
                ),
                with: {
                    amp: true,
                },
            });

            if (!comment)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Comment not found!",
                });

            const { analytics, analyticsKey, retention, retentionKey } =
                await getAnalyticsAndRetentionForAmp(comment.ampId);

            const pipeline = redis.pipeline();

            if (analytics) {
                if (analytics.comments > 0)
                    pipeline.hincrby(analyticsKey, "comments", -1);
            } else
                addAmpAnalyticsToCache({
                    id: comment.ampId,
                    views: 0,
                    likes: 0,
                    comments: 0,
                    reamps: 0,
                    bookmarks: 0,
                });

            if (retention)
                pipeline.hincrby(retentionKey, "score", -SCORE_PER_COMMENT);
            else
                addAmpRetentionToCache({
                    id: comment.ampId,
                    score: 0,
                    lastRefreshed: Date.now(),
                });

            await ctx.db.delete(comments).where(eq(comments.id, commentId));

            return { id: commentId };
        }),
});
