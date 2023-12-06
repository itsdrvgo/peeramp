"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Divider } from "@nextui-org/react";
import { redirect } from "next/navigation";
import ProfileAmps from "../profile/amps/profile-amps";
import ProfileInfo from "../profile/profile-info";
import UserPageSkeleton from "./skeletons/user-page-skeleton";

interface PageProps extends DefaultProps {
    target: CachedUserWithoutEmail;
    amps: Amp[];
}

function UserPage({ target, amps, className, ...props }: PageProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <UserPageSkeleton />;
    if (!user) redirect("/signin");

    if (target.id === user.id) redirect("/profile");

    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <ProfileInfo user={user} target={target} />
            <Divider />
            <ProfileAmps amps={amps} user={user} target={target} />
        </div>
    );
}

export default UserPage;
