"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Avatar, Link, LinkProps, Skeleton } from "@nextui-org/react";
import NextLink from "next/link";
import { redirect } from "next/navigation";

function ProfileTab({ className, ...props }: LinkProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileTabSkeleton />;

    if (!user) redirect("/signin");

    return (
        <Link
            as={NextLink}
            color="foreground"
            href="/profile"
            className={cn(
                "flex items-center gap-4 rounded-lg p-2 px-3 hover:bg-default-100",
                className
            )}
            {...props}
        >
            <div>
                <Avatar src={user.imageUrl} alt={user.username!} showFallback />
            </div>

            <div>
                <p>{user.username}</p>
                <p className="text-sm opacity-80">
                    {user.firstName} {user.lastName}
                </p>
            </div>
        </Link>
    );
}

export default ProfileTab;

function ProfileTabSkeleton({ className, ...props }: DefaultProps) {
    return (
        <div
            className={cn("flex items-center gap-4 p-2 px-3", className)}
            {...props}
        >
            <Skeleton className="h-11 w-11 rounded-full" />

            <div className="space-y-1">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-lg" />
            </div>
        </div>
    );
}
