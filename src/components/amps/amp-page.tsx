"use client";

import { User } from "@/src/lib/drizzle/schema";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    generateId,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { AmpWithAnalytics } from "@/src/lib/validation/amp";
import { DefaultProps } from "@/src/types";
import { Avatar, Image, Link, useDisclosure } from "@nextui-org/react";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import ImageViewModal from "../global/modals/image-view-modal";
import { sanitizeContent } from "../u/amps/amp-content";
import Player from "../ui/player";

interface PageProps extends DefaultProps {
    amp: AmpWithAnalytics & {
        creator: User;
    };
}

function AmpPage({ amp, className, ...props }: PageProps) {
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className={cn("flex gap-3 md:gap-4", className)} {...props}>
                <div className="flex flex-col items-center">
                    <div>
                        <Avatar
                            src={amp.creator.image}
                            alt={amp.creator.username}
                            showFallback
                        />
                    </div>

                    <div className="h-full w-[2px] bg-primary-700/20" />
                </div>

                <div className="w-full space-y-3">
                    <div className="w-full space-y-3 md:space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col items-start md:flex-row md:items-center md:gap-1">
                                <p className="font-semibold">
                                    {amp.creator.firstName}{" "}
                                    {amp.creator.lastName}
                                </p>

                                <p className="space-x-1 text-sm font-light opacity-60">
                                    <span>@{amp.creator.username}</span>
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
                            {amp.content.split("\n").map((line, i) => (
                                <span key={i}>
                                    {sanitizeContent(line)}
                                    <br />
                                </span>
                            ))}
                        </p>

                        {amp.metadata &&
                            Object.keys(amp.metadata).length > 0 &&
                            amp.metadata.isVisible && (
                                <div
                                    className={cn(
                                        "rounded-xl bg-secondary-100 p-2",
                                        amp.metadata.image
                                            ? "space-y-2 pb-3"
                                            : "space-y-0 px-2 py-3"
                                    )}
                                >
                                    {isYouTubeVideo(amp.metadata.url) ? (
                                        <div className="overflow-hidden rounded-lg">
                                            <LiteYouTubeEmbed
                                                id={
                                                    extractYTVideoId(
                                                        amp.metadata.url
                                                    ) ?? ""
                                                }
                                                title={
                                                    amp.metadata.title ??
                                                    "video_" + generateId()
                                                }
                                            />
                                        </div>
                                    ) : (
                                        amp.metadata.image && (
                                            <div>
                                                <button onClick={onOpen}>
                                                    <Image
                                                        radius="sm"
                                                        src={amp.metadata.image}
                                                        alt={
                                                            amp.metadata
                                                                .title ??
                                                            "image_" +
                                                                generateId()
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}

                                    <div className="space-y-1 px-1">
                                        {amp.metadata.title &&
                                            amp.metadata.url && (
                                                <Link
                                                    className="font-semibold text-danger-50 dark:text-primary"
                                                    href={amp.metadata.url}
                                                    underline="hover"
                                                    isExternal
                                                >
                                                    {amp.metadata.title
                                                        ? amp.metadata.title
                                                              .length > 100
                                                            ? amp.metadata.title.slice(
                                                                  0,
                                                                  100
                                                              ) + "..."
                                                            : amp.metadata.title
                                                        : amp.metadata.url}
                                                </Link>
                                            )}
                                        {amp.metadata.description && (
                                            <p className="text-sm text-white/60">
                                                {amp.metadata.description
                                                    .length > 100
                                                    ? amp.metadata.description.slice(
                                                          0,
                                                          100
                                                      ) + "..."
                                                    : amp.metadata.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                        {amp.attachments && amp.attachments.length > 0 && (
                            <div
                                className={cn(
                                    "grid grid-cols-2 gap-2",
                                    amp.attachments.length === 1 &&
                                        "grid-cols-1",
                                    amp.attachments.length === 3 &&
                                        "grid-cols-3"
                                )}
                            >
                                {amp.attachments
                                    .filter(
                                        (attachment) =>
                                            attachment?.type === "image"
                                    )
                                    .map((attachment, index) => (
                                        <Image
                                            key={attachment?.id ?? index}
                                            src={attachment?.url ?? ""}
                                            alt={attachment?.name ?? ""}
                                            radius="sm"
                                            width={800}
                                            height={800}
                                            className="aspect-video object-cover"
                                        />
                                    ))}

                                {amp.attachments
                                    .filter(
                                        (attachment) =>
                                            attachment?.type === "video"
                                    )
                                    .map((attachment, index) => (
                                        <Player
                                            key={attachment?.id ?? index}
                                            source={{
                                                type: "uploadthing",
                                                fileKey: attachment?.key ?? "",
                                            }}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ImageViewModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onClose={onClose}
                image={amp.metadata?.image ?? ""}
            />
        </>
    );
}

export default AmpPage;
