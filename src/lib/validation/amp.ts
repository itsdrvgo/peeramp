import { z } from "zod";

export const visibilitySchema = z.enum([
    "everyone",
    "following",
    "peers",
    "only-me",
]);
export const statusSchema = z.enum(["draft", "published"]);

export type Visibility = z.infer<typeof visibilitySchema>;
export type Status = z.infer<typeof statusSchema>;
