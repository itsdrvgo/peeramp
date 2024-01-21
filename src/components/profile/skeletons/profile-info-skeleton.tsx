"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button, Divider, Skeleton } from "@nextui-org/react";
import AmpLoadSkeleton from "../../global/skeletons/amp-load-skeleton";
import { Icons } from "../../icons/icons";

function ProfileInfoSkeleton({ className, ...props }: DefaultProps) {
    return (
        <div
            className={cn(
                "w-full space-y-5 px-5 py-10 md:max-w-2xl md:space-y-10",
                className
            )}
            {...props}
        >
            <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
                <Skeleton className="size-32 rounded-full" />

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="w-full space-y-4">
                        <div className="flex flex-col items-center gap-2 md:items-start">
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-5 w-32 rounded-lg md:hidden" />
                        </div>

                        <div className="hidden w-full justify-between gap-2 md:flex">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-8 rounded-lg" />
                                <span>Amps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-8 rounded-lg" />
                                <span>Peers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-8 rounded-lg" />
                                <span>Following</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 md:items-start">
                            <Skeleton className="h-5 w-28 rounded-lg" />
                            <Skeleton className="hidden h-5 w-32 rounded-lg md:block" />
                        </div>

                        <Skeleton className="h-16 w-full rounded-lg" />

                        <div className="grid grid-flow-col justify-items-stretch py-4 md:hidden">
                            <div className="flex flex-col items-center gap-1">
                                <Skeleton className="h-6 w-10 rounded-lg" />
                                <p className="text-sm opacity-60">Amps</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Skeleton className="h-6 w-10 rounded-lg" />
                                <p className="text-sm opacity-60">Peers</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Skeleton className="h-6 w-10 rounded-lg" />
                                <p className="text-sm opacity-60">Following</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 md:justify-start">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-6 w-full rounded-lg"
                                />
                            ))}
                            <div>
                                <Skeleton className="h-6 w-8 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Button
                            size="sm"
                            variant="flat"
                            startContent={<Icons.pencil className="size-4" />}
                            className="min-w-0 md:px-2"
                            isDisabled
                        >
                            <p className="md:hidden">Edit Profile</p>
                        </Button>
                    </div>
                </div>
            </div>

            <Divider />

            <div className="space-y-4">
                <div className="grid grid-flow-col justify-items-stretch gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center"
                        >
                            <Skeleton className="h-6 w-full rounded-lg" />
                        </div>
                    ))}
                </div>

                <div className="flex w-full flex-col gap-4 rounded-xl bg-default-50 p-3 py-5 md:p-5">
                    <div className="flex items-center gap-4">
                        <div>
                            <Skeleton className="size-10 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-full rounded-full" />
                    </div>

                    <Divider />

                    <div className="flex items-center gap-3 text-primary">
                        <Icons.media className="size-5" />
                        <Icons.smile className="size-5" />
                    </div>
                </div>

                <AmpLoadSkeleton />
            </div>
        </div>
    );
}

export default ProfileInfoSkeleton;
