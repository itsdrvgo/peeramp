"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Divider } from "@nextui-org/react";
import ProfileAmps from "./amps/profile-amps";
import ProfileInfo from "./profile-info";

interface PageProps extends DefaultProps {
    user: UserResource;
    amps: Amp[];
}

function ProfilePage({ className, user, amps, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <ProfileInfo user={user} />
            <Divider />
            <ProfileAmps amps={amps} user={user} />
        </div>
    );
}

export default ProfilePage;
