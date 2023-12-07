import UserPageSkeleton from "@/src/components/u/skeletons/user-page-skeleton";
import UserFetch from "@/src/components/u/user-fetch";
import { siteConfig } from "@/src/config/site";
import { db } from "@/src/lib/drizzle";
import { userDetails, users } from "@/src/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { Suspense } from "react";

const getBaseUrl = () => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
};

interface PageProps {
    params: {
        username: string;
    };
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { username } = params;

    const targets = await db
        .select({
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
            image: users.image,
            bio: userDetails.bio,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1)
        .leftJoin(userDetails, eq(users.id, userDetails.userId));

    if (targets.length === 0)
        return {
            title: "Unknown User",
            description: "Unknown User",
        };

    const target = targets[0];

    return {
        title:
            target.firstName +
            " " +
            target.lastName +
            " " +
            "(@" +
            target.username +
            ")",
        description:
            target.bio ??
            "View profile of " +
                target.firstName +
                " " +
                target.lastName +
                " on PeerAmp",
        keywords: [
            ...(siteConfig.keywords +
                ", " +
                target.firstName +
                ", " +
                target.lastName +
                ", " +
                target.username),
        ],
        twitter: {
            card: "summary_large_image",
            title:
                target.firstName +
                " " +
                target.lastName +
                " " +
                "(@" +
                target.username +
                ")",
            description:
                target.bio ??
                "View profile of " +
                    target.firstName +
                    " " +
                    target.lastName +
                    " on PeerAmp",
            images: [
                {
                    url: target.image,
                    width: 1000,
                    height: 1000,
                    alt:
                        target.firstName +
                        " " +
                        target.lastName +
                        " " +
                        "(@" +
                        target.username +
                        ")",
                },
            ],
        },
        openGraph: {
            title:
                target.firstName +
                " " +
                target.lastName +
                " " +
                "(@" +
                target.username +
                ")",
            description:
                target.bio ??
                "View profile of " +
                    target.firstName +
                    " " +
                    target.lastName +
                    " on PeerAmp",
            type: "profile",
            url: getBaseUrl() + "/u/" + target.username,
            siteName: siteConfig.name,
            images: [
                {
                    url: target.image,
                    width: 1000,
                    height: 1000,
                    alt:
                        target.firstName +
                        " " +
                        target.lastName +
                        " " +
                        "(@" +
                        target.username +
                        ")",
                },
            ],
        },
    };
}

function Page({ params }: PageProps) {
    return (
        <section className="flex w-full flex-col items-center">
            <Suspense fallback={<UserPageSkeleton />}>
                <UserFetch params={params} />
            </Suspense>
        </section>
    );
}

export default Page;
