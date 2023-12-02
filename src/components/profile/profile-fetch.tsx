"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@nextui-org/react";
import { redirect } from "next/navigation";
import ProfileInfo from "./profile-info";

function ProfileFetch({ className, ...props }: DefaultProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileInfoSkeleton />;
    if (!user) redirect("/signin");

    return <ProfileInfo user={user} className={className} {...props} />;
}

export default ProfileFetch;

function ProfileInfoSkeleton({ className, ...props }: DefaultProps) {
    return (
        <div className={cn("w-full max-w-2xl py-10", className)} {...props}>
            <div className="flex items-center justify-between gap-5">
                <Skeleton className="h-32 w-32 rounded-full" />

                <div className="flex w-full basis-2/3 justify-between gap-4">
                    <div className="w-full space-y-4">
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-16 rounded-lg" />
                        </div>

                        <div className="flex w-full max-w-xs justify-between gap-2">
                            <Skeleton className="h-5 w-16 rounded-lg" />
                            <Skeleton className="h-5 w-16 rounded-lg" />
                            <Skeleton className="h-5 w-16 rounded-lg" />
                        </div>

                        <Skeleton className="h-5 w-32 rounded-lg" />

                        <Skeleton className="h-24 w-1/2 rounded-lg" />

                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}
