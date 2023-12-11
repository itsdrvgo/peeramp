"use client";

import { siteConfig } from "@/src/config/site";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { EmptyPlaceholder } from "../../ui/empty-placeholder";

function NoUserPage({ className, ...props }: DefaultProps) {
    return (
        <div
            className={cn(
                "flex w-full items-center justify-center p-5 md:max-w-lg",
                className
            )}
            {...props}
        >
            <EmptyPlaceholder
                title="User not found"
                description={
                    "The user you are looking for does not exist, go back to " +
                    siteConfig.name
                }
                isBackgroundVisible={false}
                fullWidth
            />
        </div>
    );
}

export default NoUserPage;
