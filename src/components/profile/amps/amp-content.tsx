"use client";

import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    generateId,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { AmpWithAnalytics } from "@/src/lib/validation/amp";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Image, Link, useDisclosure } from "@nextui-org/react";
import NextImage from "next/image";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import AmpAccessoryButtons from "../../global/buttons/amp-accessory-buttons";
import ImageViewModal from "../../global/modals/image-view-modal";
import { sanitizeContent } from "../../u/amps/amp-content";
import Player from "../../ui/player";
import AmpMoreMenu from "./amp-more-menu";

interface PageProps extends DefaultProps {
    amp: AmpWithAnalytics;
    user: UserResource;
}

function AmpContent({ amp, user, className, ...props }: PageProps) {
    const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();

    return (
        <>
            <div className={cn("w-full space-y-3", className)} {...props}>
                <div className="w-full space-y-3 md:space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col items-start md:flex-row md:items-center md:gap-1">
                            <p className="font-semibold">
                                {user.firstName + " " + user.lastName}
                            </p>
                            <p className="space-x-1 text-sm font-light opacity-60">
                                <span>@{user.username}</span>
                                <span>•</span>
                                <span>
                                    {convertMstoTimeElapsed(
                                        amp.createdAt.getTime()
                                    )}
                                </span>
                            </p>
                        </div>

                        <AmpMoreMenu amp={amp} user={user} />
                    </div>

                    <p className="text-sm md:text-base">
                        {amp.content.split("\n").map((line, index) => (
                            <span key={index}>
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
                                                        amp.metadata.title ??
                                                        "image_" + generateId()
                                                    }
                                                />
                                            </button>
                                        </div>
                                    )
                                )}

                                <div className="space-y-1 px-1">
                                    {amp.metadata.title && amp.metadata.url && (
                                        <Link
                                            className="font-semibold text-default-50 dark:text-primary"
                                            href={amp.metadata.url}
                                            underline="hover"
                                            isExternal
                                        >
                                            {amp.metadata.title
                                                ? amp.metadata.title.length >
                                                  100
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
                                            {amp.metadata.description.length >
                                            100
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
                                amp.attachments.length === 1 && "grid-cols-1",
                                amp.attachments.length === 3 && "grid-cols-3"
                            )}
                        >
                            {amp.attachments
                                .filter(
                                    (attachment) => attachment?.type === "image"
                                )
                                .map((attachment, index) => (
                                    <Image
                                        as={NextImage}
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
                                    (attachment) => attachment?.type === "video"
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

                <AmpAccessoryButtons amp={amp} user={user} />
            </div>

            <ImageViewModal
                image={amp.metadata?.image ?? ""}
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
            />
        </>
    );
}

export default AmpContent;
