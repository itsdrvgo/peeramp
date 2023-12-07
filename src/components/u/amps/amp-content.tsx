"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn, convertMstoTimeElapsed } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import AmpAccessoryButtons from "../../profile/amps/amp-accessory-buttons";

interface PageProps extends DefaultProps {
    amp: Amp;
    target: CachedUserWithoutEmail;
}

function AmpContent({ amp, target, className, ...props }: PageProps) {
    return (
        <div className={cn("w-full space-y-3", className)} {...props}>
            <div className="w-full space-y-3 md:space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-start md:flex-row md:items-center md:gap-1">
                        <p className="font-semibold">
                            {target.firstName + " " + target.lastName}
                        </p>
                        <p className="space-x-1 text-sm font-light opacity-60">
                            <span>@{target.username}</span>
                            <span>•</span>
                            <span>
                                {convertMstoTimeElapsed(
                                    amp.createdAt.getTime()
                                )}
                            </span>
                        </p>
                    </div>
                </div>

                <p className="text-sm md:text-base">
                    {amp.content.split("\n").map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    ))}
                </p>
            </div>

            <AmpAccessoryButtons amp={amp} />
        </div>
    );
}

export default AmpContent;
