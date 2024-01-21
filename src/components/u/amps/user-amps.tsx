"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn } from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { useIntersection } from "@mantine/hooks";
import {
    Accordion,
    AccordionItem,
    Avatar,
    Spinner,
    Tab,
    Tabs,
} from "@nextui-org/react";
import { useEffect, useMemo, useRef } from "react";
import AmpLoadSkeleton from "../../global/skeletons/amp-load-skeleton";
import { Icons } from "../../icons/icons";
import AmpContent from "./amp-content";

interface PageProps extends DefaultProps {
    target: CachedUserWithoutEmail;
    user: UserResource | null;
}

function UserAmps({ target, user, className, ...props }: PageProps) {
    const { data: pinnedAmp, isPending: isPinnedAmpLoading } =
        trpc.amp.getPinnedAmp.useQuery({
            creatorId: target.id,
        });

    const {
        data: publishedAmpsRaw,
        isPending: isPublishedAmpsLoading,
        fetchNextPage,
        isFetchingNextPage,
    } = trpc.amp.getInfiniteAmps.useInfiniteQuery(
        {
            creatorId: target.id,
            type: "published",
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const publishedAmps = useMemo(
        () => publishedAmpsRaw?.pages.flatMap((page) => page.data) ?? [],
        [publishedAmpsRaw]
    );

    const publishedViewPortRef = useRef<HTMLDivElement>(null);
    const { entry: publishedEntry, ref: publishedRef } = useIntersection({
        root: publishedViewPortRef.current,
        threshold: 1,
    });

    useEffect(() => {
        if (
            publishedEntry?.isIntersecting &&
            publishedAmpsRaw?.pages.length &&
            publishedAmpsRaw.pages[publishedAmpsRaw.pages.length - 1].nextCursor
        ) {
            fetchNextPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publishedEntry]);

    return (
        <div className={cn("w-full", className)} {...props}>
            <Tabs aria-label="Amp Tabs" variant="underlined" fullWidth>
                <Tab key="amps" title="Amps">
                    <div className="space-y-5">
                        {isPinnedAmpLoading ? (
                            <AmpLoadSkeleton count={1} />
                        ) : (
                            pinnedAmp && (
                                <div className="group space-y-3 border-b border-black/30 p-4 px-0 dark:border-white/20 md:px-2">
                                    <div className="flex items-center gap-2 text-sm opacity-60">
                                        <Icons.pin className="size-4 fill-white" />
                                        <p>Pinned</p>
                                    </div>

                                    <div className="flex gap-3 md:gap-4">
                                        <div>
                                            <Avatar
                                                src={target.image}
                                                alt={target.username}
                                                showFallback
                                            />
                                        </div>

                                        <AmpContent
                                            amp={pinnedAmp}
                                            target={target}
                                            user={user}
                                        />
                                    </div>
                                </div>
                            )
                        )}

                        {isPublishedAmpsLoading ? (
                            <AmpLoadSkeleton />
                        ) : publishedAmps.length > 0 ? (
                            <>
                                {publishedAmps.map((amp, i) =>
                                    i === publishedAmps.length - 1 ? (
                                        <div
                                            key={amp.id}
                                            className="group space-y-3 border-b border-black/30 p-4 px-0 dark:border-white/20 md:px-2"
                                            ref={publishedRef}
                                        >
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
                                                    user={user}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            key={amp.id}
                                            className="group space-y-3 border-b border-black/30 p-4 px-0 dark:border-white/20 md:px-2"
                                        >
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
                                                    user={user}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}

                                {isFetchingNextPage && (
                                    <div className="flex justify-center">
                                        <Spinner />
                                    </div>
                                )}

                                {!isFetchingNextPage &&
                                    publishedAmpsRaw?.pages.length &&
                                    !publishedAmpsRaw.pages[
                                        publishedAmpsRaw.pages.length - 1
                                    ].nextCursor && (
                                        <div className="text-center opacity-60">
                                            <p className="text-sm md:text-base">
                                                No more amps to load
                                            </p>
                                        </div>
                                    )}
                            </>
                        ) : (
                            <div className="p-5 text-center opacity-60">
                                <p className="text-sm md:text-base">
                                    This user has not published any amps yet
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab key="about" title="About">
                    <div className="space-y-5 py-5">
                        {Object.keys(target.education).length > 0 && (
                            <Accordion
                                variant="splitted"
                                className="p-0"
                                aria-label="About"
                            >
                                <AccordionItem
                                    key="education"
                                    aria-label="Education"
                                    classNames={{
                                        base: "p-0",
                                    }}
                                    title={
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <Icons.graduationHat className="size-6" />
                                            </div>
                                            <p className="text-lg font-semibold">
                                                Education
                                            </p>
                                        </div>
                                    }
                                >
                                    {target.education.map((edu, index) => {
                                        const startTime = new Date(
                                            edu.startTimestamp.year,
                                            edu.startTimestamp.month
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        });

                                        const endTime = new Date(
                                            edu.endTimestamp.year,
                                            edu.endTimestamp.month
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        });

                                        return (
                                            <div
                                                key={edu.id}
                                                className={cn(
                                                    "space-y-2 border-black/10 px-2 dark:border-white/10",
                                                    index === 0
                                                        ? "pb-4 pt-2"
                                                        : "py-4",
                                                    {
                                                        "border-b":
                                                            index !==
                                                            target.education
                                                                .length -
                                                                1,
                                                    }
                                                )}
                                            >
                                                <p className="text-sm md:text-base">
                                                    {new Date().getTime() >
                                                    new Date(
                                                        edu.startTimestamp.year,
                                                        edu.startTimestamp.month
                                                    ).getTime()
                                                        ? "Studied"
                                                        : "Studies"}{" "}
                                                    <span className="font-semibold">
                                                        {edu.degree
                                                            .split("_")
                                                            .map(
                                                                (word) =>
                                                                    word[0].toUpperCase() +
                                                                    word.slice(
                                                                        1
                                                                    )
                                                            )
                                                            .join(" ")}{" "}
                                                    </span>
                                                    in{" "}
                                                    <span className="font-semibold">
                                                        {edu.fieldOfStudy}
                                                    </span>{" "}
                                                    at{" "}
                                                    <span className="font-semibold">
                                                        {edu.organization}
                                                    </span>
                                                </p>

                                                <p className="text-xs opacity-60 md:text-sm">
                                                    {startTime} - {endTime}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </AccordionItem>
                            </Accordion>
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
