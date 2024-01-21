import { db } from "@/src/lib/drizzle";
import { users } from "@/src/lib/drizzle/schema";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { eq } from "drizzle-orm";
import NoUserPage from "../global/404/no-user-page";
import UserPage from "./user-page";

interface PageProps extends DefaultProps {
    params: {
        username: string;
    };
}

async function UserFetch({ params, className, ...props }: PageProps) {
    const { username } = params;

    const dbTarget = await db.query.users.findFirst({
        where: eq(users.username, username),
        with: {
            details: true,
        },
    });
    if (!dbTarget) return <NoUserPage />;

    const target: CachedUserWithoutEmail = {
        id: dbTarget.id,
        username: dbTarget.username,
        createdAt: dbTarget.createdAt.toISOString(),
        gender: dbTarget.details.gender,
        bio: dbTarget.details.bio,
        category: dbTarget.details.category,
        education: dbTarget.details.education,
        firstName: dbTarget.firstName,
        lastName: dbTarget.lastName,
        image: dbTarget.image,
        isVerified: dbTarget.details.isVerified,
        resume: dbTarget.details.resume,
        socials: dbTarget.details.socials,
        type: dbTarget.details.type,
        updatedAt: dbTarget.updatedAt.toISOString(),
        usernameChangedAt: dbTarget.details.usernameChangedAt.toISOString(),
    };

    return <UserPage target={target} className={className} {...props} />;
}

export default UserFetch;
