"use client";

import { Icons } from "@/src/components/icons/icons";
import Player from "@/src/components/ui/player";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button } from "@nextui-org/react";
import { Dispatch, SetStateAction } from "react";

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
                source={{
                    type: "default",
                    url: video.url,
                }}
            />

            <div className="absolute right-1 top-1">
                <Button
                    isIconOnly
                    radius="full"
                    size="sm"
                    variant="shadow"
                    className="size-6 min-w-0"
                    startContent={<Icons.close className="size-[14px]" />}
                    onPress={() => setUploadedVideo(null)}
                />
            </div>
        </div>
    );
}

export default VideoView;
