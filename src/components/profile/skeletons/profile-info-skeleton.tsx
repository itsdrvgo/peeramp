"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Divider, Skeleton } from "@nextui-org/react";
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
                <Skeleton className="h-32 w-32 rounded-full" />

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-4 md:flex-row md:items-start">
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-center gap-2 md:justify-start">
                            <Skeleton className="h-6 w-24 rounded-lg" />
                            <Skeleton className="h-6 w-16 rounded-lg" />
                        </div>

                        <div className="hidden w-full max-w-xs justify-between gap-2 md:flex">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-5 w-16 rounded-lg"
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-center md:justify-start">
                            <Skeleton className="h-5 w-32 rounded-lg" />
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
                                    className="h-6 w-20 rounded-lg"
                                />
                            ))}
                            <Skeleton className="h-6 w-8 rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <Skeleton className="h-8 w-28 rounded-lg md:w-8" />
                    </div>
                </div>
            </div>

            <Divider />

            <div className="space-y-4">
                <div className="grid grid-flow-col justify-items-stretch">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center"
                        >
                            <Skeleton className="h-6 w-20 rounded-lg" />
                        </div>
                    ))}
                </div>

                <div className="flex w-full flex-col gap-4 rounded-xl bg-default-50 p-5">
                    <div className="flex items-center gap-4">
                        <div>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-full rounded-full" />
                    </div>

                    <Divider />

                    <div className="flex items-center gap-3 text-primary">
                        <Icons.media className="h-5 w-5" />
                        <Icons.smile className="h-5 w-5" />
                    </div>
                </div>

                <Divider />

                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex gap-4 border-b border-black/30 p-4 px-2 dark:border-white/20"
                        >
                            <div>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>

                            <div className="w-full space-y-3">
                                <Skeleton className="h-5 w-40 rounded-lg" />

                                <div className="space-y-2">
                                    {Array.from({ length: 2 }).map((_, j) => (
                                        <Skeleton
                                            key={j}
                                            className="h-5 w-full rounded-lg"
                                        />
                                    ))}
                                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProfileInfoSkeleton;
