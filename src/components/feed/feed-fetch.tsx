import { getUserFromCache } from "@/src/lib/redis/methods/user";
import { cachedUserWithoutEmailSchema } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { auth } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import FeedView from "./feed-view";

async function FeedFetch({ className, ...props }: DefaultProps) {
    const { userId } = auth();
    if (!userId) redirect("/signin");

    const user = await getUserFromCache(userId);
    if (!user) notFound();

    const parsedUser = cachedUserWithoutEmailSchema.parse(user);

    return <FeedView className={className} user={parsedUser} {...props} />;
}

export default FeedFetch;
