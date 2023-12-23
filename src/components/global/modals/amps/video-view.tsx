"use client";

import { Icons } from "@/src/components/icons/icons";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";
import { BigPlayButton, Player } from "video-react";
import "video-react/dist/video-react.css";

interface PageProps extends DefaultProps {
    video: ExtendedFile;
    setUploadedVideo: Dispatch<SetStateAction<ExtendedFile | null>>;
}

function VideoView({
    className,
    video,
    setUploadedVideo,
    ...props
}: PageProps) {
    return (
        <div
            className={cn(
                "relative flex items-center justify-center overflow-hidden rounded-md",
                className
            )}
            {...props}
        >
            <Player
                aspectRatio="16:9"
                muted={true}
                autoPlay={true}
                src={video.url}
            >
                <BigPlayButton position="center" />
            </Player>

            <div className="absolute right-1 top-1">
                <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="shadow"
                    className="h-6 w-6 min-w-0"
                    startContent={<Icons.close className="h-[14px] w-[14px]" />}
                    onPress={() => setUploadedVideo(null)}
                />
            </div>
        </div>
    );
}

export default VideoView;
