"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";

interface PageProps extends DefaultProps {
    fileKey: string;
}

function ResumePreview({ className, fileKey, ...props }: PageProps) {
    const { data, isLoading } = trpc.uploads.getFile.useQuery({
        fileKey,
    });

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                className
            )}
            {...props}
        >
            {isLoading ? (
                <p className="font-semibold opacity-70">Loading...</p>
            ) : (
                <div className="space-y-2">
                    <Link
                        href={data?.file?.url ?? "/"}
                        as={NextLink}
                        className="text-base font-semibold opacity-70"
                        isExternal
                    >
                        {data?.file?.key ?? "Resume"}
                    </Link>
                    <p className="text-sm opacity-60 md:text-base">
                        (Your Resume)
                    </p>
                </div>
            )}
        </div>
    );
}

export default ResumePreview;
