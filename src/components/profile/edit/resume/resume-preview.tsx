"use client";

import { cn } from "@/src/lib/utils";
import { Resume } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";

interface PageProps extends DefaultProps {
    resume: Resume;
}

function ResumePreview({ className, resume, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                className
            )}
            {...props}
        >
            <div className="space-y-2">
                <Link
                    href={resume?.url ?? "/"}
                    as={NextLink}
                    className="text-base font-semibold opacity-70"
                    isExternal
                >
                    {resume?.name
                        ? "file_" + resume.name.split("_")[1]
                        : "Resume"}
                </Link>
                <p className="text-sm opacity-60 md:text-base">(Your Resume)</p>
            </div>
        </div>
    );
}

export default ResumePreview;
