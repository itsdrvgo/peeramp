"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Divider } from "@nextui-org/react";
import ProfileAmps from "./amps/profile-amps";
import ProfileInfo from "./profile-info";

interface PageProps extends DefaultProps {
    user: UserResource;
    ampCount: number;
}

function ProfilePage({ className, user, ampCount, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <ProfileInfo user={user} ampCount={ampCount} />
            <Divider />
            <ProfileAmps user={user} />
        </div>
    );
}

export default ProfilePage;
