import { z } from "zod";

export const visibilitySchema = z.enum([
    "everyone",
    "following",
    "peers",
    "only-me",
]);

export const statusSchema = z.enum(["draft", "published"]);

export const ampMetadataSchema = z
    .object({
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        url: z.string(),
    })
    .nullable();

export type Visibility = z.infer<typeof visibilitySchema>;
export type Status = z.infer<typeof statusSchema>;
export type AmpMetadata = z.infer<typeof ampMetadataSchema>;
