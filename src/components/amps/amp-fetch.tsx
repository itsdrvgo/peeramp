import { db } from "@/src/lib/drizzle";
import { amps } from "@/src/lib/drizzle/schema";
import { redis } from "@/src/lib/redis";
import {
    generateAmpBookmarksKey,
    generateAmpLikesKey,
    generateCachedAmpAnalyticsKey,
} from "@/src/lib/redis/methods/amp";
import { cn } from "@/src/lib/utils";
import { CachedAmpAnalytics } from "@/src/lib/validation/amp";
import { DefaultProps } from "@/src/types";
import { currentUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import NoAmpPage from "../global/404/no-amp-page";
import AmpPage from "./amp-page";

interface PageProps extends DefaultProps {
    searchParams: {
        uId: string;
        aId: string;
    };
}

async function AmpFetch({ searchParams, className, ...props }: PageProps) {
    const { uId, aId } = searchParams;

    const user = await currentUser();
    if (!user) redirect("/signin");

    const amp = await db.query.amps.findFirst({
        where: and(eq(amps.creatorId, uId), eq(amps.id, aId)),
        with: {
            creator: true,
        },
    });
    if (!amp) return <NoAmpPage />;

    const pipeline = redis.pipeline();

    pipeline.hgetall(generateCachedAmpAnalyticsKey(amp.id));
    pipeline.sismember(generateAmpLikesKey(amp.id), user.id);
    pipeline.sismember(generateAmpBookmarksKey(amp.id), user.id);

    const results: Array<CachedAmpAnalytics | null | 0 | 1> =
        await pipeline.exec();

    const analytics = results[0] as CachedAmpAnalytics | null;
    const liked = results[1] as 0 | 1;
    const bookmarked = results[2] as 0 | 1;

    return (
        <div
            className={cn(
                "w-full max-w-2xl space-y-10 p-10 px-5 md:px-10",
                className
            )}
            {...props}
        >
            <AmpPage
                amp={{
                    ...amp,
                    views: analytics?.views || 0,
                    likes: analytics?.likes || 0,
                    bookmarks: analytics?.bookmarks || 0,
                    reamps: analytics?.reamps || 0,
                    comments: analytics?.comments || 0,
                    isLiked: liked === 1,
                    isBookmarked: bookmarked === 1,
                }}
            />
        </div>
    );
}

export default AmpFetch;
