"use client";

import { DEFAULT_PROFILE_IMAGE_URL } from "@/src/config/const";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Avatar, Link, LinkProps, Skeleton } from "@nextui-org/react";
import NextLink from "next/link";

function ProfileTab({ className, ...props }: LinkProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileTabSkeleton />;

    if (!user)
        return (
            <div>
                <Link
                    as={NextLink}
                    color="foreground"
                    href="/signin"
                    className={cn(
                        "flex items-center justify-center gap-4 rounded-lg md:justify-start md:p-2 md:px-3 md:hover:bg-default-100",
                        className
                    )}
                    {...props}
                >
                    <div className="p-2 md:p-0">
                        <Avatar
                            src={DEFAULT_PROFILE_IMAGE_URL}
                            alt="User"
                            showFallback
                            className="size-6 md:size-10"
                        />
                    </div>

                    <div className="hidden md:block">
                        <p>Sign in</p>
                        <p className="text-sm opacity-80">
                            You are not signed in
                        </p>
                    </div>
                </Link>
            </div>
        );

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
                    className="size-6 md:size-10"
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
            <Skeleton className="size-6 rounded-full md:size-10" />

            <div className="hidden space-y-1 md:block">
                <Skeleton className="h-5 w-20 rounded-lg" />
                <Skeleton className="h-4 w-28 rounded-lg" />
            </div>
        </div>
    );
}
