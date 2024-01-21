import { z } from "zod";
import { Amp } from "../drizzle/schema";

export const visibilitySchema = z.enum([
    "everyone",
    "following",
    "peers",
    "only-me",
]);

export const statusSchema = z.enum(["draft", "published"]);

export const cachedAmpAnalyticsSchema = z.object({
    id: z.string(),
    views: z.number().default(0),
    likes: z.number().default(0),
    reamps: z.number().default(0),
    comments: z.number().default(0),
    bookmarks: z.number().default(0),
});

export const cachedAmpRetentionsSchema = z.object({
    id: z.string(),
    score: z.number().default(0),
    lastRefreshed: z.number().default(0),
});

export const ampMetadataSchema = z
    .object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        url: z.string(),
        isVisible: z.boolean().default(true).optional(),
    })
    .nullable();

export const ampAttachmentSchema = z
    .object({
        type: z.enum(["image", "video"]),
        url: z.string(),
        id: z.string(),
        key: z.string(),
        name: z.string(),
    })
    .nullable();

export type Visibility = z.infer<typeof visibilitySchema>;
export type Status = z.infer<typeof statusSchema>;
export type AmpMetadata = z.infer<typeof ampMetadataSchema>;
export type AmpAttachment = z.infer<typeof ampAttachmentSchema>;
export type CachedAmpAnalytics = z.infer<typeof cachedAmpAnalyticsSchema>;
export type CachedAmpRetention = z.infer<typeof cachedAmpRetentionsSchema>;
export type AmpWithAnalytics = CachedAmpAnalytics &
    Amp & { isLiked: boolean; isBookmarked: boolean };
