import { z } from "zod";

export const presets = z.union([
    z.literal("original"),
    z.literal("portrait"),
    z.literal("landscape"),
    z.literal("square"),
]);

export type Preset = z.infer<typeof presets>;
