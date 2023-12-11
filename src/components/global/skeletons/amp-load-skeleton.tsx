import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Skeleton } from "@nextui-org/react";

function AmpLoadSkeleton({
    className,
    count = 3,
    ...props
}: DefaultProps & { count?: number }) {
    return (
        <div className={cn("space-y-4", className)} {...props}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex gap-2 border-b border-black/30 p-4 px-0 dark:border-white/20 md:gap-4 md:px-2"
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
    );
}

export default AmpLoadSkeleton;
