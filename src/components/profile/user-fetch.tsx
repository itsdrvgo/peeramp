"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfilePage from "./profile-page";
import ProfileInfoSkeleton from "./skeletons/profile-info-skeleton";

interface PageProps extends DefaultProps {
    amps: Amp[];
    ampCount: number;
}

function UserFetch({ className, amps, ampCount, ...props }: PageProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileInfoSkeleton />;
    if (!user) redirect("/signin");

    return (
        <ProfilePage
            user={user}
            className={className}
            amps={amps}
            {...props}
            ampCount={ampCount}
        />
    );
}

export default UserFetch;
