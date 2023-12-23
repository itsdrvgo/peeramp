"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import { cn, extractYTVideoId, isYouTubeVideo } from "@/src/lib/utils";
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
import { EmojiStyle, Theme } from "emoji-picker-react";
import { LucideIcon } from "lucide-react";
import { nanoid } from "nanoid";
import dynamic from "next/dynamic";
import {
    ChangeEvent,
    ClipboardEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { FixedCropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { z } from "zod";
import { Icons } from "../../../icons/icons";
import AmpManageButtons from "./amp-manage-buttons";
import ImageAdjust from "./image-adjust";
import ImageAdjustButtons from "./image-adjust-buttons";
import ImageView from "./image-view";
import VideoView from "./video-view";

const DynamicEmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
});

const acceptedImageTypes: string[] = ["image/png", "image/jpeg", "image/jpg"];
const acceptedVideoTypes: string[] = ["video/mp4", "video/mkv"];
const maxFileSize: number = 1024 * 1024 * 1024; // 1 GB in bytes

const presets = z.union([
    z.literal("original"),
    z.literal("portrait"),
    z.literal("landscape"),
    z.literal("square"),
]);

export type Preset = z.infer<typeof presets>;

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
    // AMP VISIBILITY
    const [visibility, setVisibility] = useState<Selection>(
        new Set([amp?.visibility ?? "everyone"])
    );
    const [iconString, setIconString] = useState<keyof typeof Icons>("globe");
    const [Icon, setIcon] = useState<LucideIcon>(Icons.globe);

    // AMP CONTENT
    const [text, setText] = useState(amp?.content ?? "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [link, setLink] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(
        amp?.metadata?.isVisible ?? true
    );
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // AMP DROPZONE
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AMP MEDIA
    const cropperRef = useRef<FixedCropperRef>(null);

    const [uploadedImages, setUploadedImages] = useState<ExtendedFile[]>([]);
    const [uploadedVideo, setUploadedVideo] = useState<ExtendedFile | null>(
        null
    );

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

    const { data: linkPreview, isLoading: isLinkLoading } =
        trpc.link.getMetadata.useQuery({
            link,
        });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node)
            ) {
                setIsEmojiPickerOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [emojiPickerRef]);

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

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        const isImageSelected = isFileTypeSelected(files, acceptedImageTypes);
        const isVideoSelected = isFileTypeSelected(files, acceptedVideoTypes);

        if (isImageSelected && isVideoSelected)
            return toast.error(
                "You can only upload images or videos, not both"
            );
        if (isImageSelected && files.length > 4)
            return toast.error("You can only upload a maximum of 4 images");
        if (isVideoSelected && files.length > 1)
            return toast.error("You can only upload a single video");

        if (isImageSelected) handleImageFiles(files, acceptedImageTypes);
        if (isVideoSelected) handleVideoFile(files);
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();

        const files = event.clipboardData.files;
        const isImageSelected = isFileTypeSelected(files, acceptedImageTypes);
        const isVideoSelected = isFileTypeSelected(files, acceptedVideoTypes);

        if (isImageSelected && isVideoSelected)
            return toast.error(
                "You can only upload images or videos, not both"
            );

        if (isImageSelected) handleImageFiles(files, acceptedImageTypes);
        if (isVideoSelected) handleVideoFile(files);

        if (!isImageSelected && !isVideoSelected) {
            const text = event.clipboardData.getData("text/plain");
            setText((prev) => prev + text);
        }

        event.clipboardData.clearData();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files: FileList = event.target.files;
            const isImageSelected: boolean = isFileTypeSelected(
                files,
                acceptedImageTypes
            );
            const isVideoSelected: boolean = isFileTypeSelected(
                files,
                acceptedVideoTypes
            );

            if (isImageSelected && isVideoSelected)
                return toast.error(
                    "You can only upload images or videos, not both"
                );
            if (isImageSelected && files.length > 4)
                return toast.error("You can only upload a maximum of 4 images");
            if (isVideoSelected && files.length > 1)
                return toast.error("You can only upload a single video");

            if (isImageSelected) handleImageFiles(files, acceptedImageTypes);
            if (isVideoSelected) handleVideoFile(files);
        }
    };

    const handleImageFiles = async (
        files: FileList,
        acceptedTypes: string[]
    ) => {
        const acceptedFiles: ExtendedFile[] = [];
        const rejectedFiles: ExtendedFile[] = [];

        if (uploadedVideo)
            return toast.error(
                "You can only upload images or videos, not both"
            );

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (acceptedTypes.includes(file.type) && file.size <= maxFileSize)
                acceptedFiles.push({
                    id: nanoid(),
                    file,
                    url: URL.createObjectURL(file),
                });
            else
                rejectedFiles.push({
                    id: nanoid(),
                    file,
                    url: URL.createObjectURL(file),
                });
        }

        if (rejectedFiles.length > 0)
            toast.error(
                rejectedFiles.length +
                    " files were rejected, " +
                    rejectedFiles.map((file) => file.file.name).join(", ")
            );

        const newUploadedImages = [...uploadedImages, ...acceptedFiles];

        if (newUploadedImages.length > 4)
            return toast.error(
                "You can only upload a maximum of 4 images, remove some images and try again"
            );

        setUploadedImages(newUploadedImages);
    };

    const handleVideoFile = (files: FileList) => {
        if (files.length > 1)
            return toast.error("You can only upload a single video");

        if (uploadedImages.length > 0)
            return toast.error(
                "You can only upload images or videos, not both"
            );

        const videoFile = files[0];
        if (
            acceptedVideoTypes.includes(videoFile.type) &&
            videoFile.size <= maxFileSize
        )
            setUploadedVideo({
                id: nanoid(),
                file: videoFile,
                url: URL.createObjectURL(videoFile),
            });
        else
            toast.error(
                "Could not upload video file, please try again with a different file"
            );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setIsEmojiPickerOpen(false);
            }}
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
                                    editingImage && "hidden",
                                )}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setIsDragging(false);
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDrop={handleDrop}
                                onPaste={handlePaste}
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

                                    <div className="relative flex items-center gap-1">
                                        <Button
                                            isIconOnly
                                            radius="full"
                                            variant="light"
                                            size="sm"
                                            startContent={
                                                <Icons.media className="h-5 w-5 text-primary" />
                                            }
                                            onPress={() => openFileDialog()}
                                        />

                                        <Button
                                            isIconOnly
                                            radius="full"
                                            variant="light"
                                            size="sm"
                                            startContent={
                                                <Icons.smile className="h-5 w-5 text-primary" />
                                            }
                                            className="hidden md:flex"
                                            onPress={() =>
                                                setIsEmojiPickerOpen(
                                                    !isEmojiPickerOpen
                                                )
                                            }
                                        />
                                        {isEmojiPickerOpen && (
                                            <div
                                                className="absolute bottom-10 left-0"
                                                ref={emojiPickerRef}
                                            >
                                                <DynamicEmojiPicker
                                                    theme={Theme.DARK}
                                                    emojiStyle={
                                                        EmojiStyle.TWITTER
                                                    }
                                                    previewConfig={{
                                                        showPreview: false,
                                                    }}
                                                    searchDisabled={true}
                                                    lazyLoadEmojis={true}
                                                    onEmojiClick={(emoji) => {
                                                        setText(
                                                            (prev) =>
                                                                prev +
                                                                emoji.emoji
                                                        );
                                                        textareaRef.current?.focus();
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept={`${acceptedImageTypes.join(
                                        ","
                                    )},${acceptedVideoTypes.join(",")}`}
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
                                                            "video_" + nanoid()
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
                                                                    nanoid()
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
                                                    className="h-6 w-6 min-w-0"
                                                    startContent={
                                                        <Icons.close className="h-[14px] w-[14px]" />
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

                                {uploadedImages.length > 0 && !editingImage && (
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
                                            <Icon className="h-4 w-4" />
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

                            {editingImage && (
                                <ImageAdjust
                                    imageFile={editingImage}
                                    preset={selectedPreset}
                                    setPreset={setSelectedPreset}
                                    cropperRef={cropperRef}
                                />
                            )}
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
                                    setIsEmojiPickerOpen={setIsEmojiPickerOpen}
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

const isFileTypeSelected = (
    files: FileList,
    acceptedTypes: string[]
): boolean => {
    for (let i = 0; i < files.length; i++) {
        if (acceptedTypes.includes(files[i].type)) {
            return true;
        }
    }
    return false;
};
