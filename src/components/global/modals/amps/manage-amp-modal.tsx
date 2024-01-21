"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { useDropzone } from "@/src/hooks/useDropzone";
import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import {
    cn,
    extractYTVideoId,
    generateId,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { Preset } from "@/src/lib/validation/image";
import { UploadEvent } from "@/src/types";
import {
    Avatar,
    Button,
    Image,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    Selection,
    SelectItem,
    Spinner,
    Textarea,
} from "@nextui-org/react";
import { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FixedCropperRef } from "react-advanced-cropper";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { Icons } from "../../../icons/icons";
import AmpManageButtons from "./amp-manage-buttons";
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
    userId: string;
    image: string;
    username: string;
    firstName: string;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    amp?: Amp;
}

function ManageAmpModal({
    onClose,
    isOpen,
    onOpenChange,
    userId,
    image,
    username,
    firstName,
    amp,
}: PageProps) {
    const { processFiles, uploadConfig } = useDropzone({
        image: IMAGE_DEFAULTS,
        video: VIDEO_DEFAULTS,
    });
    const [uploadedImages, setUploadedImages] = useState<ExtendedFile[]>([]);
    const [uploadedVideo, setUploadedVideo] = useState<ExtendedFile | null>(
        null
    );

    const [visibility, setVisibility] = useState<Selection>(
        new Set([amp?.visibility ?? "everyone"])
    );
    const [iconString, setIconString] = useState<keyof typeof Icons>("globe");
    const [Icon, setIcon] = useState<LucideIcon>(Icons.globe);

    const [text, setText] = useState(amp?.content ?? "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [link, setLink] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(
        amp?.metadata?.isVisible ?? true
    );

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cropperRef = useRef<FixedCropperRef>(null);

    const [editingImage, setEditingImage] = useState<ExtendedFile | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<Preset>("square");

    useEffect(() => {
        const isLink = text.match(/https?:\/\/[^\s]+/g);
        if (isLink) {
            setLink(isLink[0]);
            setIsPreviewVisible(true);
        } else {
            setLink("");
            setIsPreviewVisible(false);
        }
    }, [text]);

    const { data: linkPreview, isPending: isLinkLoading } =
        trpc.link.getMetadata.useQuery({
            link,
        });

    useEffect(() => {
        switch (Array.from(visibility).toString()) {
            case "everyone":
                setIconString("globe");
                break;
            case "following":
                setIconString("users");
                break;
            case "peers":
                setIconString("refresh");
                break;
            default:
                setIconString("lock");
                break;
        }
        setIcon(Icons[iconString] as LucideIcon);
    }, [iconString, visibility]);

    const openFileDialog = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

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
                            setText(
                                value.slice(0, selectionStart) +
                                    text +
                                    value.slice(selectionEnd)
                            );
                        } else {
                            setText(value + text);
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
                                    uploadConfig.image?.maxCount +
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
                                    uploadConfig.video?.maxCount +
                                    " videos"
                            );

                        setUploadedVideo(data.videos[0]);
                    }
                }
                break;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={onOpenChange}
            className="overflow-visible"
            placement="center"
            classNames={{
                body: "w-auto",
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>
                            {amp ? "Edit Amp" : "Create Amp"}
                        </ModalHeader>

                        <ModalBody>
                            <div
                                className={cn(
                                    "space-y-2 overflow-y-auto rounded-lg border border-primary/0 p-1",
                                    isDragging &&
                                        "border-dashed border-primary",
                                    editingImage && "hidden"
                                )}
                                onDragLeave={() => setIsDragging(false)}
                                onDragOver={() => setIsDragging(true)}
                                onDrop={handleUpload}
                                onPaste={handleUpload}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <Avatar
                                                src={image}
                                                alt={username}
                                            />
                                        </div>

                                        <div className="w-full space-y-1">
                                            <p className="font-semibold">
                                                {username}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            isIconOnly
                                            radius="full"
                                            variant="light"
                                            size="sm"
                                            startContent={
                                                <Icons.media className="size-5 text-primary" />
                                            }
                                            onPress={() => openFileDialog()}
                                        />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    className="hidden"
                                    accept={Object.values(uploadConfig)
                                        .map((config) => config.fileTypes)
                                        .flat()
                                        .join(", ")}
                                    multiple
                                />

                                <Textarea
                                    autoFocus
                                    placeholder={
                                        "What are you thinking, " +
                                        firstName +
                                        "?"
                                    }
                                    variant="underlined"
                                    value={text}
                                    onValueChange={setText}
                                    ref={textareaRef}
                                />

                                {isLinkLoading ? (
                                    <div className="flex justify-center py-2">
                                        <Spinner size="sm" />
                                    </div>
                                ) : (
                                    linkPreview &&
                                    Object.keys(linkPreview).length > 0 &&
                                    (isPreviewVisible ? (
                                        <div
                                            className={cn(
                                                "relative rounded-xl bg-default-100 p-1",
                                                linkPreview.image
                                                    ? "space-y-2 pb-3"
                                                    : "space-y-0 px-2 py-3"
                                            )}
                                        >
                                            {isYouTubeVideo(linkPreview.url) ? (
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
                                                        {linkPreview.title
                                                            .length > 100
                                                            ? linkPreview.title.slice(
                                                                  0,
                                                                  100
                                                              ) + "..."
                                                            : linkPreview.title}
                                                    </p>
                                                )}
                                                {linkPreview.description && (
                                                    <p className="text-sm opacity-60">
                                                        {linkPreview.description
                                                            .length > 100
                                                            ? linkPreview.description.slice(
                                                                  0,
                                                                  100
                                                              ) + "..."
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
                                                Link preview has been disabled
                                            </p>
                                            <Button
                                                size="sm"
                                                color="primary"
                                                className="font-semibold text-white dark:text-black"
                                                onPress={() =>
                                                    setIsPreviewVisible(true)
                                                }
                                            >
                                                Show
                                            </Button>
                                        </div>
                                    ))
                                )}

                                {uploadedImages.length > 0 && (
                                    <ImageView
                                        uploadedImages={uploadedImages}
                                        setUploadedImages={setUploadedImages}
                                        setEditingImage={setEditingImage}
                                    />
                                )}

                                {uploadedVideo && (
                                    <VideoView
                                        video={uploadedVideo}
                                        setUploadedVideo={setUploadedVideo}
                                    />
                                )}

                                <div className="flex items-center gap-2">
                                    <p className="text-sm">
                                        Who can see this post?
                                    </p>

                                    <Select
                                        size="sm"
                                        disallowEmptySelection
                                        selectedKeys={visibility}
                                        onSelectionChange={setVisibility}
                                        startContent={
                                            <Icon className="size-4" />
                                        }
                                        className="max-w-xs"
                                        radius="sm"
                                    >
                                        <SelectItem key="everyone">
                                            Everyone
                                        </SelectItem>
                                        <SelectItem key="following">
                                            People You Follow
                                        </SelectItem>
                                        <SelectItem key="peers">
                                            Your Peers
                                        </SelectItem>
                                        <SelectItem key="only-me">
                                            Only Me
                                        </SelectItem>
                                    </Select>
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
                                    userId={userId}
                                    uploadedImages={uploadedImages}
                                    editingImage={editingImage}
                                    setPreset={setSelectedPreset}
                                    setUploadedImages={setUploadedImages}
                                    setEditingImage={setEditingImage}
                                />
                            ) : (
                                <AmpManageButtons
                                    closeModal={close}
                                    isPreviewVisible={isPreviewVisible}
                                    text={text}
                                    visibility={visibility}
                                    userId={userId}
                                    uploadedImages={uploadedImages}
                                    uploadedVideo={uploadedVideo}
                                    amp={amp}
                                    linkPreview={linkPreview}
                                    onClose={onClose}
                                    setText={setText}
                                    setVisibility={setVisibility}
                                />
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ManageAmpModal;
