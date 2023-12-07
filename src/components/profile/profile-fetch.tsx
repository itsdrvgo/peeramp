import { db } from "@/src/lib/drizzle";
import { amps } from "@/src/lib/drizzle/schema";
import { auth } from "@clerk/nextjs";
import { and, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import UserFetch from "./user-fetch";

async function ProfileFetch() {
    const { userId } = auth();
    if (!userId) redirect("/signin");

    const data = await db.query.amps.findMany({
        limit: 10,
        where: eq(amps.creatorId, userId),
        orderBy: [desc(amps.createdAt)],
    });

    const allAmps = await db
        .select({
            count: sql`COUNT(*)`,
        })
        .from(amps)
        .where(and(eq(amps.creatorId, userId), eq(amps.status, "published")));

    return <UserFetch amps={data} ampCount={Number(allAmps[0].count)} />;
}

export default ProfileFetch;
