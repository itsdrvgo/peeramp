import { db } from "@/src/lib/drizzle";
import { amps, users } from "@/src/lib/drizzle/schema";
import { getUserFromCache } from "@/src/lib/redis/methods/user";
import { cachedUserWithoutEmailSchema } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import UserPage from "./user-page";

interface PageProps extends DefaultProps {
    params: {
        username: string;
    };
}

async function UserFetch({ params, className, ...props }: PageProps) {
    const { username } = params;

    const targetFromDB = await db.query.users.findFirst({
        where: eq(users.username, username),
    });
    if (!targetFromDB) notFound();

    const target = await getUserFromCache(targetFromDB.id);
    if (!target) notFound();

    const parsedTarget = cachedUserWithoutEmailSchema.parse(target);

    const data = await db.query.amps.findMany({
        limit: 10,
        where: eq(amps.creatorId, target.id),
    });

    return (
        <UserPage
            amps={data}
            target={parsedTarget}
            className={className}
            {...props}
        />
    );
}

export default UserFetch;
