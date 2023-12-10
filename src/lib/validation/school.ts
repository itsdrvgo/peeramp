import { z } from "zod";

export const schoolResponseSchema = z.object({
    web_pages: z.array(z.string()),
    name: z.string(),
    alpha_two_code: z.string(),
    country: z.string(),
    "state-province": z.string().nullable(),
    domains: z.array(z.string()),
});

export const schoolResponseArraySchema = z.array(schoolResponseSchema);

export type SchoolResponse = z.infer<typeof schoolResponseSchema>;
