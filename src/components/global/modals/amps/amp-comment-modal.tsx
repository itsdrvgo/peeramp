"use client";

import { Icons } from "@/src/components/icons/icons";
import { sanitizeContent } from "@/src/components/u/amps/amp-content";
import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { useDropzone } from "@/src/hooks/useDropzone";
import { trpc } from "@/src/lib/trpc/client";
import {
    cn,
    convertMstoTimeElapsed,
    extractYTVideoId,
    generateId,
    handleClientError,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { AmpWithAnalytics } from "@/src/lib/validation/amp";
import { Preset } from "@/src/lib/validation/image";
import { UploadEvent } from "@/src/types";
import { UserResource } from "@clerk/types";
import {
    Avatar,
    Button,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Skeleton,
    Spinner,
    Textarea,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { FixedCropperRef } from "react-advanced-cropper";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import ImageAdjust from "./image-adjust";
import ImageAdjustButtons from "./image-adjust-buttons";
import ImageView from "./image-view";
import VideoView from "./video-view";

const IMAGE_DEFAULTS = {
    maxCount: 4,
    maxFileSize: 1024 * 1024 * 5, // 5MB
    fileTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/jpg",
    ],
};

const VIDEO_DEFAULTS = {
    maxCount: 1,
    maxFileSize: 1024 * 1024 * 256, // 256MB
    fileTypes: ["video/mp4", "video/mkv", "video/mov"],
};
interface PageProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    amp: AmpWithAnalytics;
    user: UserResource;
}

function AmpCommentModal({
    amp,
    isOpen,
    onClose,
    onOpenChange,
    user,
}: PageProps) {
    const { processFiles, uploadConfig } = useDropzone({
        image: IMAGE_DEFAULTS,
        video: VIDEO_DEFAULTS,
    });

    const [uploadedImages, setUploadedImages] = useState<ExtendedFile[]>([]);
    const [uploadedVideo, setUploadedVideo] = useState<ExtendedFile | null>(
        null
    );

    const [comment, setComment] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [link, setLink] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cropperRef = useRef<FixedCropperRef>(null);

    const [editingImage, setEditingImage] = useState<ExtendedFile | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<Preset>("square");

    useEffect(() => {
        const isLink = comment.match(/https?:\/\/[^\s]+/g);
        if (isLink) {
            setLink(isLink[0]);
            setIsPreviewVisible(true);
        } else {
            setLink("");
            setIsPreviewVisible(false);
        }
    }, [comment]);

    const { data: linkPreview, isPending: isLinkLoading } =
        trpc.link.getMetadata.useQuery({
            link,
        });

    const { mutate: addComment } = trpc.amp.comments.addComment.useMutation({
        onMutate: () => {
            const toastId = toast.loading("Posting comment...");
            return { toastId };
        },
        onSuccess: (_, __, ctx) => {
            toast.success("Added comment", { id: ctx?.toastId });
        },
        onError: (err, _, ctx) => {
            handleClientError(err, ctx?.toastId);
        },
    });

    const handleUpload = (uploadEvent: UploadEvent) => {
        const { message, type, data, isError } = processFiles(uploadEvent);

        if (isError) return toast.error(message);
        if (!type) return toast.error("Invalid file type");
        if (!data) return toast.error(DEFAULT_ERROR_MESSAGE);

        if (data.rejectedFiles.length > 0) {
            const rejectedVideos = data.rejectedFiles.filter((data) =>
                data.file.type.includes("video")
            );
            const rejectedImages = data.rejectedFiles.filter((data) =>
                data.file.type.includes("image")
            );

            if (rejectedVideos.length > 0)
                toast.error(
                    rejectedVideos
                        .map((data) => "'" + data.file.name + "'")
                        .join(", ") +
                        " video(s) were rejected, make sure the videos are of max " +
                        VIDEO_DEFAULTS.maxFileSize / 1024 / 1024 +
                        " MB, and of " +
                        VIDEO_DEFAULTS.fileTypes
                            .map((type) => "'" + type + "'")
                            .join(", ") +
                        " types"
                );

            if (rejectedImages.length > 0)
                toast.error(
                    rejectedImages
                        .map((data) => "'" + data.file.name + "'")
                        .join(", ") +
                        " image(s) were rejected, make sure the images are of max " +
                        IMAGE_DEFAULTS.maxFileSize / 1024 / 1024 +
                        " MB, and of " +
                        IMAGE_DEFAULTS.fileTypes
                            .map((type) => "'" + type + "'")
                            .join(", ") +
                        " types"
                );
        }

        switch (type) {
            case "text":
                {
                    const textarea = textareaRef.current;
                    if (textarea) {
                        const { selectionStart, selectionEnd, value } =
                            textarea;
                        const text = message;
                        if (selectionStart !== selectionEnd) {
                            setComment(
                                value.slice(0, selectionStart) +
                                    text +
                                    value.slice(selectionEnd)
                            );
                        } else {
                            setComment(value + text);
                        }
                    }
                }
                break;

            case "file":
                {
                    if (data.images.length > 0) {
                        if (uploadedVideo)
                            return toast.error(
                                "You can't upload both image and video"
                            );

                        if (
                            data.images.length + uploadedImages.length >
                            uploadConfig.image!.maxCount
                        )
                            return toast.error(
                                "You can't upload more than " +
                                    uploadConfig.image!.maxCount +
                                    " images"
                            );

                        setUploadedImages((prev) => [...prev, ...data.images]);
                    }

                    if (data.videos.length > 0) {
                        if (uploadedImages.length > 0)
                            return toast.error(
                                "You can't upload both image and video"
                            );

                        if (data.videos.length > uploadConfig.video!.maxCount)
                            return toast.error(
                                "You can't upload more than " +
                                    uploadConfig.video!.maxCount +
                                    " videos"
                            );

                        setUploadedVideo(data.videos[0]);
                    }
                }
                break;
        }
    };

    const { data: ampCreator, isPending: isAmpCreatorLoading } =
        trpc.user.getUser.useQuery({
            userId: amp.creatorId,
        });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            placement="center"
            size="xl"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Add Comment</ModalHeader>

                        <ModalBody>
                            <div
                                className={cn(
                                    "flex flex-col gap-2",
                                    editingImage && "hidden"
                                )}
                            >
                                <div className="flex gap-3 md:gap-4">
                                    <div className="flex flex-col items-center">
                                        <div>
                                            <Avatar
                                                src={ampCreator?.image}
                                                alt={amp.creatorId}
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
                                                        {isAmpCreatorLoading ||
                                                        !ampCreator ? (
                                                            <Skeleton className="h-5 w-20 rounded-md" />
                                                        ) : (
                                                            ampCreator.firstName +
                                                            " " +
                                                            ampCreator.lastName
                                                        )}
                                                    </p>
                                                    <p className="space-x-1 text-sm font-light opacity-60">
                                                        <span>
                                                            {isAmpCreatorLoading ||
                                                            !ampCreator ? (
                                                                <Skeleton className="h-4 w-16 rounded-md" />
                                                            ) : (
                                                                "@" +
                                                                ampCreator.username
                                                            )}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {convertMstoTimeElapsed(
                                                                amp.createdAt.getTime()
                                                            )}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-sm">
                                                {amp.content
                                                    .split("\n")
                                                    .map((line, index) => (
                                                        <span key={index}>
                                                            {sanitizeContent(
                                                                line
                                                            )}
                                                            <br />
                                                        </span>
                                                    ))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        "space-y-2 overflow-y-auto rounded-lg border border-primary/0",
                                        isDragging &&
                                            "border-dashed border-primary"
                                    )}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        setIsDragging(false);
                                    }}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDrop={handleUpload}
                                    onPaste={handleUpload}
                                >
                                    <div className="flex gap-3 md:gap-4">
                                        <div>
                                            <Avatar
                                                src={user.imageUrl}
                                                alt={user.username!}
                                                showFallback
                                            />
                                        </div>

                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold">
                                                    {user.username}
                                                </p>

                                                <Button
                                                    isIconOnly
                                                    radius="full"
                                                    variant="light"
                                                    size="sm"
                                                    startContent={
                                                        <Icons.media className="size-5 text-primary" />
                                                    }
                                                    onPress={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                />
                                            </div>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleUpload}
                                                className="hidden"
                                                accept={Object.values(
                                                    uploadConfig
                                                )
                                                    .map(
                                                        (config) =>
                                                            config.fileTypes
                                                    )
                                                    .flat()
                                                    .join(", ")}
                                                multiple
                                            />

                                            <Textarea
                                                autoFocus
                                                placeholder="Add a comment..."
                                                variant="underlined"
                                                value={comment}
                                                onValueChange={setComment}
                                                ref={textareaRef}
                                            />

                                            {isLinkLoading ? (
                                                <div className="flex justify-center py-2">
                                                    <Spinner size="sm" />
                                                </div>
                                            ) : (
                                                linkPreview &&
                                                Object.keys(linkPreview)
                                                    .length > 0 &&
                                                (isPreviewVisible ? (
                                                    <div
                                                        className={cn(
                                                            "relative rounded-xl bg-default-100 p-1",
                                                            linkPreview.image
                                                                ? "space-y-2 pb-3"
                                                                : "space-y-0 px-2 py-3"
                                                        )}
                                                    >
                                                        {isYouTubeVideo(
                                                            linkPreview.url
                                                        ) ? (
                                                            <div className="overflow-hidden rounded-lg">
                                                                <LiteYouTubeEmbed
                                                                    id={
                                                                        extractYTVideoId(
                                                                            linkPreview.url
                                                                        ) ?? ""
                                                                    }
                                                                    title={
                                                                        linkPreview.title ??
                                                                        "video_" +
                                                                            generateId()
                                                                    }
                                                                />
                                                            </div>
                                                        ) : (
                                                            linkPreview.image && (
                                                                <div>
                                                                    <Image
                                                                        radius="sm"
                                                                        src={
                                                                            linkPreview.image
                                                                        }
                                                                        alt={
                                                                            linkPreview.title ??
                                                                            "image_" +
                                                                                generateId()
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}

                                                        <div className="px-1">
                                                            {linkPreview.title && (
                                                                <p className="font-semibold">
                                                                    {linkPreview
                                                                        .title
                                                                        .length >
                                                                    100
                                                                        ? linkPreview.title.slice(
                                                                              0,
                                                                              100
                                                                          ) +
                                                                          "..."
                                                                        : linkPreview.title}
                                                                </p>
                                                            )}
                                                            {linkPreview.description && (
                                                                <p className="text-sm opacity-60">
                                                                    {linkPreview
                                                                        .description
                                                                        .length >
                                                                    100
                                                                        ? linkPreview.description.slice(
                                                                              0,
                                                                              100
                                                                          ) +
                                                                          "..."
                                                                        : linkPreview.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="absolute right-2 top-0 z-10">
                                                            <Button
                                                                isIconOnly
                                                                radius="full"
                                                                size="sm"
                                                                variant="shadow"
                                                                className="size-6 min-w-0"
                                                                startContent={
                                                                    <Icons.close className="size-[14px]" />
                                                                }
                                                                onPress={() =>
                                                                    setIsPreviewVisible(
                                                                        false
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between gap-2 rounded-xl bg-default-100 p-2">
                                                        <p className="text-sm opacity-80">
                                                            Link preview has
                                                            been disabled
                                                        </p>
                                                        <Button
                                                            size="sm"
                                                            color="primary"
                                                            className="font-semibold text-white dark:text-black"
                                                            onPress={() =>
                                                                setIsPreviewVisible(
                                                                    true
                                                                )
                                                            }
                                                        >
                                                            Show
                                                        </Button>
                                                    </div>
                                                ))
                                            )}

                                            {uploadedImages.length > 0 && (
                                                <ImageView
                                                    uploadedImages={
                                                        uploadedImages
                                                    }
                                                    setUploadedImages={
                                                        setUploadedImages
                                                    }
                                                    setEditingImage={
                                                        setEditingImage
                                                    }
                                                />
                                            )}

                                            {uploadedVideo && (
                                                <VideoView
                                                    video={uploadedVideo}
                                                    setUploadedVideo={
                                                        setUploadedVideo
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ImageAdjust
                                type="non-fixed"
                                imageFile={editingImage}
                                preset={selectedPreset}
                                setPreset={setSelectedPreset}
                                cropperRef={cropperRef}
                                className={cn(!editingImage && "hidden")}
                            />
                        </ModalBody>

                        <ModalFooter>
                            {editingImage ? (
                                <ImageAdjustButtons
                                    cropperRef={cropperRef}
                                    userId={user.id}
                                    uploadedImages={uploadedImages}
                                    editingImage={editingImage}
                                    setPreset={setSelectedPreset}
                                    setUploadedImages={setUploadedImages}
                                    setEditingImage={setEditingImage}
                                />
                            ) : (
                                <>
                                    <Button
                                        radius="sm"
                                        className="font-semibold"
                                        onPress={() => {
                                            close();
                                            setUploadedImages([]);
                                            setUploadedVideo(null);
                                            setComment("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="font-semibold dark:text-black"
                                        color="primary"
                                        radius="sm"
                                        isDisabled={!comment}
                                        onPress={() =>
                                            addComment({
                                                ampId: amp.id,
                                                authorId: user.id,
                                                content: comment,
                                                metadata: null,
                                                attachments: null,
                                            })
                                        }
                                    >
                                        Post
                                    </Button>
                                </>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default AmpCommentModal;
