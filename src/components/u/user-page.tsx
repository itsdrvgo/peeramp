"use client";

import { trpc } from "@/src/lib/trpc/client";
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
}

function UserPage({ target, className, ...props }: PageProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <UserPageSkeleton />;

    if (target.id === user?.id) redirect("/profile");

    const { data } = trpc.amp.getAmpCount.useQuery({
        creatorId: target.id,
    });

    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <UserInfo ampCount={data ?? 0} target={target} />
            <Divider />
            <UserAmps target={target} user={user} />
        </div>
    );
}

export default UserPage;
