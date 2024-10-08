import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
    ignoredRoutes: ["/api/users", "/og.webp", "/favicon.ico", "/test"],
    publicRoutes: [
        "/signin(.*)",
        "/signup(.*)",
        "/api/uploadthing(.*)",
        "/",
        "/api/trpc(.*)",
        "/u(.*)",
    ],
    afterAuth: (auth, req) => {
        const url = new URL(req.nextUrl.origin);

        if (auth.isPublicRoute) {
            const isAuthenticated =
                auth.userId &&
                (["/signin", "/signup"].some((route) =>
                    req.nextUrl.pathname.startsWith(route)
                ) ||
                    req.nextUrl.pathname === "/");

            if (isAuthenticated) {
                url.pathname = "/feed";
                return NextResponse.redirect(url);
            }

            return NextResponse.next();
        }

        if (!auth.userId) {
            url.pathname = "/signin";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    },
});

export const config = {
    matcher: "/((?!_next/image|_next/static|favicon.ico|site.webmanifest).*)",
};
