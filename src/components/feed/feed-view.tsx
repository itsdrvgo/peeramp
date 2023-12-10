"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import CreateAmpCard from "../ui/create-amp-card";

function FeedView({ className, ...props }: DefaultProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div
            className={cn(
                "w-full max-w-2xl space-y-10 p-10 px-5 md:px-10",
                className
            )}
            {...props}
        >
            <div>
                {user && (
                    <CreateAmpCard
                        firstName={user.firstName!}
                        image={user.imageUrl}
                        userId={user.id}
                        username={user.username!}
                    />
                )}
            </div>
        </div>
    );
}

export default FeedView;
