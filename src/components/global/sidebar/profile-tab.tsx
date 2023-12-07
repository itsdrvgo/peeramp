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
                "flex items-center justify-center gap-4 rounded-lg md:justify-start md:p-2 md:px-3 md:hover:bg-default-100",
                className
            )}
            {...props}
        >
            <div className="p-2 md:p-0">
                <Avatar
                    src={user.imageUrl}
                    alt={user.username!}
                    showFallback
                    className="h-6 w-6 md:h-10 md:w-10"
                />
            </div>

            <div className="hidden md:block">
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
            <Skeleton className="h-6 w-6 rounded-full md:h-10 md:w-10" />

            <div className="hidden space-y-1 md:block">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-lg" />
            </div>
        </div>
    );
}
