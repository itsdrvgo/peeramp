import { authMiddleware } from "@clerk/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { CResponse } from "./lib/utils";

const cache = new Map();

const globalRateLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, "60s"),
    ephemeralCache: cache,
    analytics: true,
    timeout: 1000,
});

export default authMiddleware({
    ignoredRoutes: ["/api/users", "/og.webp", "/favicon.ico"],
    publicRoutes: ["/signin(.*)", "/signup(.*)", "/api/uploadthing(.*)", "/"],
    apiRoutes: ["/api(.*)"],
    afterAuth: async (auth, req, evt) => {
        const url = new URL(req.nextUrl.origin);

        if (auth.isPublicRoute) {
            if (
                auth.userId &&
                (["/signin", "/signup"].includes(req.nextUrl.pathname) ||
                    req.nextUrl.pathname === "/")
            ) {
                url.pathname = "/home";
                return NextResponse.redirect(url);
            } else return NextResponse.next();
        }

        if (!auth.userId) {
            url.pathname = "/signin";
            return NextResponse.redirect(url);
        }

        if (auth.isApiRoute) {
            const { success, pending, limit, reset, remaining } =
                await globalRateLimiter.limit(auth.userId);
            evt.waitUntil(pending);

            const res = success
                ? NextResponse.next()
                : CResponse({ message: "TOO_MANY_REQUESTS" });

            res.headers.set("X-RateLimit-Limit", limit.toString());
            res.headers.set("X-RateLimit-Remaining", remaining.toString());
            res.headers.set("X-RateLimit-Reset", reset.toString());
            return res;
        }

        return NextResponse.next();
    },
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
};
