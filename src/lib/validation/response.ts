import { z } from "zod";

export const responseValidator = z.object({
    code: z.union([
        z.literal(200),
        z.literal(400),
        z.literal(401),
        z.literal(403),
        z.literal(404),
        z.literal(400),
        z.literal(429),
        z.literal(500),
        z.literal(503),
        z.literal(504),
        z.literal(500),
        z.literal(422),
        z.literal(501),
        z.literal(201),
        z.literal(502),
    ]),
    message: z.union([
        z.literal("OK"),
        z.literal("ERROR"),
        z.literal("UNAUTHORIZED"),
        z.literal("FORBIDDEN"),
        z.literal("NOT_FOUND"),
        z.literal("BAD_REQUEST"),
        z.literal("TOO_MANY_REQUESTS"),
        z.literal("INTERNAL_SERVER_ERROR"),
        z.literal("SERVICE_UNAVAILABLE"),
        z.literal("GATEWAY_TIMEOUT"),
        z.literal("UNKNOWN_ERROR"),
        z.literal("UNPROCESSABLE_ENTITY"),
        z.literal("NOT_IMPLEMENTED"),
        z.literal("CREATED"),
        z.literal("BAD_GATEWAY"),
    ]),
    data: z.unknown().optional(),
});

export type ResponseData = z.infer<typeof responseValidator>;
