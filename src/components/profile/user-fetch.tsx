"use client";

import { trpc } from "@/src/lib/trpc/client";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfilePage from "./profile-page";
import ProfileInfoSkeleton from "./skeletons/profile-info-skeleton";

function UserFetch({ className, ...props }: DefaultProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileInfoSkeleton />;
    if (!user) redirect("/signin");

    const { data } = trpc.amp.getAmpCount.useQuery({
        creatorId: user.id,
    });

    return (
        <ProfilePage
            user={user}
            className={className}
            {...props}
            ampCount={data ?? 0}
        />
    );
}

export default UserFetch;
