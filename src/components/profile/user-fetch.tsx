"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfileInfo from "./profile-info";
import ProfileInfoSkeleton from "./skeletons/profile-info-skeleton";

interface PageProps extends DefaultProps {
    amps: Amp[];
}

function UserFetch({ className, amps, ...props }: PageProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileInfoSkeleton />;
    if (!user) redirect("/signin");

    return (
        <ProfileInfo user={user} className={className} amps={amps} {...props} />
    );
}

export default UserFetch;
