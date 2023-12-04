"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn, convertMstoTimeElapsed } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Avatar, Button, Tab, Tabs } from "@nextui-org/react";
import { Icons } from "../icons/icons";
import CreateAmpCard from "../ui/create-amp-card";

interface PageProps extends DefaultProps {
    user: UserResource;
    amps: Amp[];
}

function ProfileAmps({ user, amps, className, ...props }: PageProps) {
    return (
        <div className={cn("w-full", className)} {...props}>
            <Tabs aria-label="Amp Tabs" variant="underlined" fullWidth>
                <Tab key="amps" title="Amps">
                    <div className="space-y-5">
                        <CreateAmpCard
                            firstName={user.firstName!}
                            image={user.imageUrl}
                            userId={user.id}
                            username={user.username!}
                            metadata={user.publicMetadata}
                        />

                        {amps.filter((amp) => amp.status === "published")
                            .length > 0 ? (
                            <div className="space-y-4">
                                {amps
                                    .filter((amp) => amp.status === "published")
                                    .map((amp) => (
                                        <div
                                            key={amp.id}
                                            className="flex gap-4 border-b border-black/30 p-4 px-2 dark:border-white/20"
                                        >
                                            <div>
                                                <Avatar
                                                    src={user.imageUrl}
                                                    alt={user.username!}
                                                    showFallback
                                                />
                                            </div>

                                            <div className="w-full space-y-3">
                                                <div className="w-full space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-semibold">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </p>
                                                        <p className="space-x-1 text-sm font-light opacity-60">
                                                            <span>
                                                                @{user.username}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {convertMstoTimeElapsed(
                                                                    amp.createdAt.getTime()
                                                                )}
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <p className="text-sm md:text-base">
                                                        {amp.content
                                                            .split("\n")
                                                            .map(
                                                                (
                                                                    line,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        {line}
                                                                        <br />
                                                                    </span>
                                                                )
                                                            )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between gap-2">
                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        variant="light"
                                                        size="sm"
                                                        startContent={
                                                            <Icons.comment className="h-4 w-4" />
                                                        }
                                                    />

                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        variant="light"
                                                        size="sm"
                                                        startContent={
                                                            <Icons.repeat className="h-4 w-4" />
                                                        }
                                                    />

                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        variant="light"
                                                        size="sm"
                                                        startContent={
                                                            <Icons.heart className="h-4 w-4" />
                                                        }
                                                    />

                                                    <Button
                                                        isIconOnly
                                                        radius="full"
                                                        variant="light"
                                                        size="sm"
                                                        startContent={
                                                            <Icons.analytics className="h-4 w-4" />
                                                        }
                                                    />

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            isIconOnly
                                                            radius="full"
                                                            variant="light"
                                                            size="sm"
                                                            startContent={
                                                                <Icons.bookmark className="h-4 w-4" />
                                                            }
                                                        />

                                                        <Button
                                                            isIconOnly
                                                            radius="full"
                                                            variant="light"
                                                            size="sm"
                                                            startContent={
                                                                <Icons.share className="h-4 w-4" />
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-5 text-center opacity-60">
                                <p className="text-sm md:text-base">
                                    You don&apos;t have any amps yet.
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab key="drafts" title="Drafts">
                    {amps.filter((amp) => amp.status === "draft").length > 0 ? (
                        <div className="space-y-4">
                            {amps
                                .filter((amp) => amp.status === "draft")
                                .map((amp) => (
                                    <div
                                        key={amp.id}
                                        className="flex gap-4 border-b border-black/30 p-4 px-2 dark:border-white/20"
                                    >
                                        <div>
                                            <Avatar
                                                src={user.imageUrl}
                                                alt={user.username!}
                                                showFallback
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1">
                                                <p className="font-semibold">
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </p>
                                                <p className="space-x-1 text-sm font-light opacity-60">
                                                    <span>
                                                        @{user.username}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {convertMstoTimeElapsed(
                                                            amp.createdAt.getTime()
                                                        )}
                                                    </span>
                                                </p>
                                            </div>

                                            <p className="text-sm md:text-base">
                                                {amp.content
                                                    .split("\n")
                                                    .map((line, index) => (
                                                        <span key={index}>
                                                            {line}
                                                            <br />
                                                        </span>
                                                    ))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="p-5 text-center opacity-60">
                            <p className="text-sm md:text-base">
                                You don&apos;t have any drafts yet.
                            </p>
                        </div>
                    )}
                </Tab>
                <Tab key="saved" title="Saved">
                    <div className="p-5 text-center opacity-60">
                        <p className="text-sm md:text-base">
                            You don&apos;t have any saved amps yet.
                        </p>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

export default ProfileAmps;
