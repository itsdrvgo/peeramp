"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Divider } from "@nextui-org/react";
import { redirect } from "next/navigation";
import UserAmps from "./amps/user-amps";
import UserPageSkeleton from "./skeletons/user-page-skeleton";
import UserInfo from "./user-info";

interface PageProps extends DefaultProps {
    target: CachedUserWithoutEmail;
    amps: Amp[];
    ampCount: number;
}

function UserPage({ target, amps, ampCount, className, ...props }: PageProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <UserPageSkeleton />;

    if (target.id === user?.id) redirect("/profile");

    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <UserInfo ampCount={ampCount} target={target} />
            <Divider />
            <UserAmps amps={amps} target={target} />
        </div>
    );
}

export default UserPage;
