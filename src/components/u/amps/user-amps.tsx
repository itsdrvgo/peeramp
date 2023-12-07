"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { Avatar, Tab, Tabs } from "@nextui-org/react";
import { Icons } from "../../icons/icons";
import AmpContent from "./amp-content";

interface PageProps extends DefaultProps {
    target: CachedUserWithoutEmail;
    amps: Amp[];
}

function UserAmps({ target, amps, className, ...props }: PageProps) {
    return (
        <div className={cn("w-full", className)} {...props}>
            <Tabs aria-label="Amp Tabs" variant="underlined" fullWidth>
                <Tab key="amps" title="Amps">
                    <div className="space-y-5">
                        {amps.filter((amp) => amp.status === "published")
                            .length > 0 ? (
                            <div className="space-y-4">
                                {amps
                                    .filter((amp) => amp.status === "published")
                                    .sort(
                                        (a, b) =>
                                            (b.pinned ? 1 : 0) -
                                            (a.pinned ? 1 : 0)
                                    )
                                    .map((amp) => (
                                        <div
                                            key={amp.id}
                                            className="group space-y-3 border-b border-black/30 p-4 px-0 dark:border-white/20 md:px-2"
                                        >
                                            {amp.pinned && (
                                                <div className="flex items-center gap-2 text-sm opacity-60">
                                                    <Icons.pin className="h-4 w-4 fill-white" />
                                                    <p>Pinned</p>
                                                </div>
                                            )}

                                            <div className="flex gap-3 md:gap-4">
                                                <div>
                                                    <Avatar
                                                        src={target.image}
                                                        alt={target.username}
                                                        showFallback
                                                    />
                                                </div>

                                                <AmpContent
                                                    amp={amp}
                                                    target={target}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-5 text-center opacity-60">
                                <p className="text-sm md:text-base">
                                    This user has no amps yet
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab key="tagged" title="Tagged">
                    <div className="p-5 text-center opacity-60">
                        <p className="text-sm md:text-base">
                            This user has not been tagged in any amps yet
                        </p>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

export default UserAmps;
