"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { useIntersection } from "@mantine/hooks";
import { Avatar, Spinner, Tab, Tabs } from "@nextui-org/react";
import { useEffect, useMemo, useRef } from "react";
import AmpLoadSkeleton from "../../global/skeletons/amp-load-skeleton";
import { Icons } from "../../icons/icons";
import CreateAmpCard from "../../ui/create-amp-card";
import AmpContent from "./amp-content";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileAmps({ user, className, ...props }: PageProps) {
    const { data: pinnedAmp, isPending: isPinnedAmpLoading } =
        trpc.amp.getPinnedAmp.useQuery({
            creatorId: user.id,
        });

    const {
        data: publishedAmpsRaw,
        isPending: isPublishedAmpsLoading,
        fetchNextPage: fetchNextPublishedAmpsPage,
        isFetchingNextPage: isFetchingNextPublishedAmpsPage,
    } = trpc.amp.getInfiniteAmps.useInfiniteQuery(
        {
            creatorId: user.id,
            type: "published",
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const {
        data: draftAmpsRaw,
        isPending: isDraftAmpsLoading,
        fetchNextPage: fetchNextDraftAmpsPage,
        isFetchingNextPage: isFetchingNextDraftAmpsPage,
    } = trpc.amp.getInfiniteAmps.useInfiniteQuery(
        {
            creatorId: user.id,
            type: "draft",
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const publishedAmps = useMemo(
        () => publishedAmpsRaw?.pages.flatMap((page) => page.data) ?? [],
        [publishedAmpsRaw]
    );

    const draftAmps = useMemo(
        () => draftAmpsRaw?.pages.flatMap((page) => page.data) ?? [],
        [draftAmpsRaw]
    );

    const publishedViewPortRef = useRef<HTMLDivElement>(null);
    const { entry: publishedEntry, ref: publishedRef } = useIntersection({
        root: publishedViewPortRef.current,
        threshold: 1,
    });

    const draftViewPortRef = useRef<HTMLDivElement>(null);
    const { entry: draftEntry, ref: draftRef } = useIntersection({
        root: draftViewPortRef.current,
        threshold: 1,
    });

    useEffect(() => {
        if (
            publishedEntry?.isIntersecting &&
            publishedAmpsRaw?.pages.length &&
            publishedAmpsRaw.pages[publishedAmpsRaw.pages.length - 1].nextCursor
        ) {
            fetchNextPublishedAmpsPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publishedEntry]);

    useEffect(() => {
        if (
            draftEntry?.isIntersecting &&
            draftAmpsRaw?.pages.length &&
            draftAmpsRaw.pages[draftAmpsRaw.pages.length - 1].nextCursor
        ) {
            fetchNextDraftAmpsPage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draftEntry]);

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
                        />

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
                                                src={user.imageUrl}
                                                alt={user.username!}
                                                showFallback
                                            />
                                        </div>

                                        <AmpContent
                                            amp={pinnedAmp}
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
                                                        src={user.imageUrl}
                                                        alt={user.username!}
                                                        showFallback
                                                    />
                                                </div>

                                                <AmpContent
                                                    amp={amp}
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
                                                        src={user.imageUrl}
                                                        alt={user.username!}
                                                        showFallback
                                                    />
                                                </div>

                                                <AmpContent
                                                    amp={amp}
                                                    user={user}
                                                />
                                            </div>
                                        </div>
                                    )
                                )}

                                {isFetchingNextPublishedAmpsPage && (
                                    <div className="flex justify-center">
                                        <Spinner />
                                    </div>
                                )}

                                {!isFetchingNextPublishedAmpsPage &&
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
                                    You don&apos;t have any amps yet
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab key="drafts" title="Drafts">
                    <div className="space-y-4">
                        {isDraftAmpsLoading ? (
                            <AmpLoadSkeleton />
                        ) : draftAmps.length > 0 ? (
                            <>
                                {draftAmps.map((amp, i) =>
                                    i === draftAmps.length - 1 ? (
                                        <div
                                            key={amp.id}
                                            className="flex gap-4 border-b border-black/30 p-4 px-2 dark:border-white/20"
                                            ref={draftRef}
                                        >
                                            <div>
                                                <Avatar
                                                    src={user.imageUrl}
                                                    alt={user.username!}
                                                    showFallback
                                                />
                                            </div>

                                            <AmpContent amp={amp} user={user} />
                                        </div>
                                    ) : (
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

                                            <AmpContent amp={amp} user={user} />
                                        </div>
                                    )
                                )}

                                {isFetchingNextDraftAmpsPage && (
                                    <div className="flex justify-center">
                                        <Spinner />
                                    </div>
                                )}

                                {!isFetchingNextDraftAmpsPage &&
                                    draftAmpsRaw?.pages.length &&
                                    !draftAmpsRaw.pages[
                                        draftAmpsRaw.pages.length - 1
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
                                    You don&apos;t have any drafts yet
                                </p>
                            </div>
                        )}
                    </div>
                </Tab>

                <Tab key="saved" title="Saved">
                    <div className="p-5 text-center opacity-60">
                        <p className="text-sm md:text-base">
                            You don&apos;t have any saved amps yet
                        </p>
                    </div>
                </Tab>

                <Tab key="tagged" title="Tagged">
                    <div className="p-5 text-center opacity-60">
                        <p className="text-sm md:text-base">
                            You haven&apos;t tagged any amps yet
                        </p>
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}

export default ProfileAmps;
