"use client";

import { cn } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import CreateAmpCard from "../ui/create-amp-card";

interface PageProps extends DefaultProps {
    user: CachedUserWithoutEmail;
}

function FeedView({ className, user, ...props }: PageProps) {
    return (
        <>
            <div
                className={cn(
                    "w-full max-w-2xl space-y-10 p-10 px-5 md:px-10",
                    className
                )}
                {...props}
            >
                <div>
                    <CreateAmpCard
                        firstName={user.firstName}
                        image={user.image}
                        userId={user.id}
                        username={user.username}
                    />
                </div>
            </div>
        </>
    );
}

export default FeedView;
