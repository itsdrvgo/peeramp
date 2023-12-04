import { db } from "@/src/lib/drizzle";
import { amps } from "@/src/lib/drizzle/schema";
import { auth } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
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

    return <UserFetch amps={data} />;
}

export default ProfileFetch;
