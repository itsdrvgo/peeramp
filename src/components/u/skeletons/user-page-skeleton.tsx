"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button, Divider, Skeleton } from "@nextui-org/react";
import AmpLoadSkeleton from "../../global/skeletons/amp-load-skeleton";
import { Icons } from "../../icons/icons";

function UserPageSkeleton({ className, ...props }: DefaultProps) {
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

                <div className="flex w-full basis-2/3 flex-col gap-4">
                    <div className="flex items-center justify-center gap-4 md:justify-between">
                        <div className="flex flex-col items-center gap-2 md:items-start">
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-5 w-32 rounded-lg md:hidden" />
                        </div>

                        <div className="hidden items-center gap-2 md:flex">
                            <Button
                                radius="sm"
                                className="h-auto py-1 dark:text-black"
                                color="primary"
                                isDisabled
                            >
                                Follow
                            </Button>
                            <Button
                                radius="sm"
                                className="h-auto py-1"
                                isDisabled
                            >
                                Message
                            </Button>
                            <Button
                                size="sm"
                                isIconOnly
                                radius="full"
                                variant="light"
                                startContent={
                                    <Icons.moreHor className="size-4" />
                                }
                                isDisabled
                            />
                        </div>
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

                    <div className="space-y-5 py-1 md:hidden">
                        <Divider />

                        <div className="flex gap-2">
                            <Button
                                radius="sm"
                                className="h-auto w-full py-[6px] dark:text-black"
                                color="primary"
                                isDisabled
                            >
                                Follow
                            </Button>
                            <Button
                                radius="sm"
                                className="h-auto w-full py-[6px]"
                                isDisabled
                            >
                                Message
                            </Button>
                            <Button
                                radius="sm"
                                className="h-auto w-full py-[6px]"
                                isDisabled
                            >
                                More
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Divider />

            <div className="space-y-4">
                <div className="grid grid-flow-col justify-items-stretch gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center"
                        >
                            <Skeleton className="h-6 w-full rounded-lg" />
                        </div>
                    ))}
                </div>

                <AmpLoadSkeleton />
            </div>
        </div>
    );
}

export default UserPageSkeleton;
