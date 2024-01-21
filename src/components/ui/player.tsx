"use client";

import { cn } from "@/src/lib/utils";
import { Button, Spinner } from "@nextui-org/react";
import {
    KeyboardEvent,
    MediaHTMLAttributes,
    useEffect,
    useRef,
    useState,
} from "react";
import { Icons } from "../icons/icons";
import "./player.css";

const UPLOADTHING_BASE_URL = "https://utfs.io/f/";

type GeneralPlayerProps = {
    type: "default";
    url: string;
};

type UploadThingPlayerProps = {
    type: "uploadthing";
    fileKey: string;
};

interface VideoProps extends MediaHTMLAttributes<HTMLVideoElement> {
    source: GeneralPlayerProps | UploadThingPlayerProps;
}

function Player({ className, source, ...props }: VideoProps) {
    const [videoURL, setVideoURL] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [volume, setVolume] = useState(0);
    const [timestamp, setTimestamp] = useState("00:00 / 00:00");
    const [progress, setProgress] = useState(0);

    const [isUserIdle, setIsUserIdle] = useState(false);
    let timeoutId = useRef<NodeJS.Timeout | null>(null);

    const handleMouseMove = () => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        setIsUserIdle(false);

        timeoutId.current = setTimeout(() => {
            setIsUserIdle(true);
        }, 2000);
    };

    useEffect(() => {
        const playerContainer = playerContainerRef.current;

        if (playerContainer) {
            playerContainer.addEventListener("mousemove", handleMouseMove);
            return () => {
                playerContainer.removeEventListener(
                    "mousemove",
                    handleMouseMove
                );
            };
        }
    }, [videoURL]);

    useEffect(() => {
        if (source.type === "default") {
            setVideoURL(source.url);
            setIsLoading(false);
            return;
        }

        const fetchVideo = async () => {
            const res = await fetch(UPLOADTHING_BASE_URL + source.fileKey);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setVideoURL(url);
            setIsLoading(false);
        };

        fetchVideo();
    }, [source]);

    const handleProgress = () => {
        const video = videoRef.current;
        if (video) {
            const percent = (video.currentTime / video.duration) * 100;
            setProgress(percent);
        }
    };

    const toggleFullScreen = () => {
        const playerContainer = playerContainerRef.current;
        if (playerContainer) {
            if (isFullScreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            } else {
                playerContainer.requestFullscreen();
                setIsFullScreen(true);
            }
        }
    };

    const handleTimestamp = () => {
        const video = videoRef.current;
        if (video) {
            const current = video.currentTime;
            const duration = video.duration;
            const currentMinutes = Math.floor(current / 60);
            const currentSeconds = Math.floor(current - currentMinutes * 60);
            const durationMinutes = Math.floor(duration / 60);
            const durationSeconds = Math.floor(duration - durationMinutes * 60);

            const currentMinutesString = currentMinutes
                .toString()
                .padStart(2, "0");
            const currentSecondsString = currentSeconds
                .toString()
                .padStart(2, "0");
            const durationMinutesString = durationMinutes
                .toString()
                .padStart(2, "0");
            const durationSecondsString = durationSeconds
                .toString()
                .padStart(2, "0");

            setTimestamp(
                `${currentMinutesString}:${currentSecondsString} / ${durationMinutesString}:${durationSecondsString}`
            );
        }
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
            if (video.paused || video.ended) {
                if (volume === 0) setVolume(70);
                video.play();
                setIsPlaying(true);
            } else {
                video.pause();
                setIsPlaying(false);
            }
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (video && videoURL) {
            video.addEventListener("timeupdate", handleTimestamp);
            return () => {
                video.removeEventListener("timeupdate", handleTimestamp);
            };
        }
    }, [videoURL]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && videoURL) {
            video.addEventListener("timeupdate", handleProgress);
            return () => {
                video.removeEventListener("timeupdate", handleProgress);
            };
        }
    }, [videoURL]);

    useEffect(() => {
        const slider = document.querySelector<HTMLInputElement>(
            ".video_progress_bar"
        );
        const video = videoRef.current;
        if (slider && video && videoURL) {
            slider.style.background = `linear-gradient(to right, hsl(0, 0%, 100%) ${progress}%, rgb(58, 58, 58) ${progress}%)`;
        }
    }, [progress, videoURL]);

    useEffect(() => {
        const video = videoRef.current;
        const slider = document.querySelector<HTMLInputElement>(".volume_bar");
        if (video && slider && videoURL) {
            video.volume = volume / 100;
            slider.style.background = `linear-gradient(to right, hsl(0, 0%, 100%) ${volume}%, rgb(58, 58, 58) ${volume}%)`;
        }
    }, [volume, videoURL]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === " ") togglePlay();
        else if (e.key === "ArrowLeft") {
            const video = videoRef.current;
            if (video) {
                const newTime = video.currentTime - 5;
                video.currentTime = newTime;
            }
        } else if (e.key === "ArrowRight") {
            const video = videoRef.current;
            if (video) {
                const newTime = video.currentTime + 5;
                video.currentTime = newTime;
            }
        } else if (e.key === "ArrowUp") {
            if (volume >= 95) setVolume(100);
            else if (volume < 95) setVolume(volume + 5);
        } else if (e.key === "ArrowDown") {
            if (volume <= 5) setVolume(0);
            else if (volume > 5) setVolume(volume - 5);
        } else if (e.key === "f") {
            toggleFullScreen();
        } else if (e.key === "m") {
            if (volume > 0) setVolume(0);
            else if (volume === 0) setVolume(70);
        }
    };

    if (isLoading)
        return (
            <div className="flex aspect-video w-full items-center justify-center bg-black">
                <Spinner />
            </div>
        );

    if (!videoURL)
        return (
            <div className="flex aspect-video w-full items-center justify-center bg-black">
                <span className="text-white">Video not found</span>
            </div>
        );

    return (
        <>
            <div
                tabIndex={0}
                className={cn(
                    "group relative w-full overflow-hidden",
                    isUserIdle && "cursor-none"
                )}
                ref={playerContainerRef}
                onKeyDown={handleKeyDown}
            >
                <video
                    className={cn("block w-full outline-none", className)}
                    ref={videoRef}
                    onClick={togglePlay}
                    controls={false}
                    onContextMenu={(e) => e.preventDefault()}
                    muted={volume === 0}
                    autoPlay
                    src={videoURL}
                    {...props}
                >
                    Your browser does not support the video tag.
                </video>

                <div
                    className={cn(
                        "absolute bottom-0 left-0 w-full translate-y-0 space-y-1 bg-gradient-to-t from-black to-transparent px-3 py-1 transition-all ease-in-out",
                        isUserIdle && "translate-y-full",
                        !isPlaying && "translate-y-0"
                    )}
                >
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={progress}
                        onChange={(e) => {
                            const video = videoRef.current;
                            if (video) {
                                const value = +e.target.value;
                                const newTime = (video.duration / 100) * value;
                                video.currentTime = newTime;
                                setProgress(value);
                                if (volume === 0) setVolume(70);
                            }
                        }}
                        className="video_progress_bar"
                    />

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                radius="full"
                                className="text-white"
                                onPress={togglePlay}
                                startContent={
                                    isPlaying ? (
                                        <Icons.pause className="size-4 fill-white" />
                                    ) : (
                                        <Icons.play className="size-4 fill-white" />
                                    )
                                }
                            />

                            <div className="flex w-24 items-center gap-1">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    radius="full"
                                    className="text-white"
                                    startContent={
                                        volume === 0 ? (
                                            <Icons.volumeX className="size-4 fill-white" />
                                        ) : volume > 90 ? (
                                            <Icons.volume2 className="size-4 fill-white" />
                                        ) : volume > 40 ? (
                                            <Icons.volume1 className="size-4 fill-white" />
                                        ) : (
                                            <Icons.volume className="size-4 fill-white" />
                                        )
                                    }
                                    onPress={() =>
                                        volume > 0
                                            ? setVolume(0)
                                            : setVolume(100)
                                    }
                                />

                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={volume}
                                    onChange={(e) => setVolume(+e.target.value)}
                                    className="volume_bar"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="pointer-events-none text-xs text-white">
                                {timestamp}
                            </span>

                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                radius="full"
                                className="text-white"
                                onPress={toggleFullScreen}
                                startContent={
                                    isFullScreen ? (
                                        <Icons.exitFullscreen className="size-4" />
                                    ) : (
                                        <Icons.enterFullscreen className="size-4" />
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Player;
