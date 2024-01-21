"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn, handleClientError } from "@/src/lib/utils";
import { AmpWithAnalytics } from "@/src/lib/validation/amp";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, Tooltip, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";
import AmpCommentModal from "../modals/amps/amp-comment-modal";

interface PageProps extends DefaultProps {
    amp: AmpWithAnalytics;
    user: UserResource | null;
}

function AmpAccessoryButtons({ amp, user, className, ...props }: PageProps) {
    const [likes, setLikes] = useState(amp.likes);
    const [isLiked, setIsLiked] = useState(amp.isLiked);

    const [bookmarks, setBookmarks] = useState(amp.bookmarks);
    const [isBookmarked, setIsBookmarked] = useState(amp.isBookmarked);

    const {
        isOpen: isCommentModalOpen,
        onOpen: openCommentModal,
        onOpenChange: onCommentModalOpenChange,
        onClose: closeCommentModal,
    } = useDisclosure();

    const { mutate: manageLike } = trpc.amp.likes.manageLikes.useMutation({
        onMutate: ({ action }) => {
            if (action === "like") {
                setLikes((prev) => prev + 1);
                setIsLiked(true);
            } else {
                setLikes((prev) => prev - 1);
                setIsLiked(false);
            }
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    const { mutate: manageBookmark } =
        trpc.amp.bookmarks.manageBookmarks.useMutation({
            onMutate: ({ action }) => {
                if (action === "add") {
                    setBookmarks((prev) => prev + 1);
                    setIsBookmarked(true);
                    toast.success("Added to bookmarks");
                } else {
                    setBookmarks((prev) => prev - 1);
                    setIsBookmarked(false);
                    toast.success("Removed from bookmarks");
                }
            },
            onError: (err) => {
                handleClientError(err);
            },
        });

    return (
        <>
            <div
                className={cn(
                    "flex items-center justify-between gap-2",
                    {
                        hidden: amp.status === "draft",
                    },
                    className
                )}
                {...props}
            >
                <Tooltip content="Comment" delay={1000} placement="bottom">
                    <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        startContent={<Icons.comment className="size-4" />}
                        className="text-sm hover:text-yellow-600"
                        onPress={() => {
                            if (!user)
                                return toast.error("You are not logged in!");

                            openCommentModal();
                        }}
                    >
                        {amp.comments}
                    </Button>
                </Tooltip>

                <Tooltip content="Reamp" delay={1000} placement="bottom">
                    <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        startContent={<Icons.repeat className="size-4" />}
                        className="text-sm hover:text-sky-600"
                    >
                        {amp.reamps}
                    </Button>
                </Tooltip>

                <Tooltip content="Love" delay={1000} placement="bottom">
                    <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        startContent={
                            <Icons.heart
                                className={cn(
                                    "size-4",
                                    isLiked && "fill-red-600 text-red-600"
                                )}
                            />
                        }
                        className="text-sm hover:text-red-600"
                        onPress={() => {
                            if (!user)
                                return toast.error("You are not logged in!");

                            manageLike({
                                action: isLiked ? "unlike" : "like",
                                ampId: amp.id,
                                userId: user.id,
                            });
                        }}
                    >
                        {likes}
                    </Button>
                </Tooltip>

                <Tooltip content="Views" delay={1000} placement="bottom">
                    <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        startContent={<Icons.analytics className="size-4" />}
                        className="text-sm"
                    >
                        {amp.views}
                    </Button>
                </Tooltip>

                <Tooltip content="Bookmarks" delay={1000} placement="bottom">
                    <Button
                        radius="full"
                        variant="light"
                        size="sm"
                        startContent={
                            <Icons.bookmark
                                className={cn(
                                    "size-4",
                                    isBookmarked &&
                                        "fill-blue-600 text-blue-600"
                                )}
                            />
                        }
                        className="text-sm hover:text-blue-600"
                        onPress={() => {
                            if (!user)
                                return toast.error("You are not logged in!");

                            manageBookmark({
                                action: isBookmarked ? "remove" : "add",
                                ampId: amp.id,
                                userId: user.id,
                            });
                        }}
                    >
                        {bookmarks}
                    </Button>
                </Tooltip>
            </div>

            <AmpCommentModal
                isOpen={isCommentModalOpen}
                onOpenChange={onCommentModalOpenChange}
                onClose={closeCommentModal}
                amp={amp}
                user={user!}
            />
        </>
    );
}

export default AmpAccessoryButtons;
