"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { useDropzone } from "@/src/hooks/useDropzone";
import { cn, generateId, handleClientError } from "@/src/lib/utils";
import { UploadEvent } from "@/src/types";
import { UserResource } from "@clerk/types";
import {
    Avatar,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FixedCropperRef } from "react-advanced-cropper";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";
import ImageAdjust from "./amps/image-adjust";

interface PfpUploadModalProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function PfpUploadModal({
    user,
    onClose,
    isOpen,
    onOpenChange,
}: PfpUploadModalProps) {
    const { processFiles, uploadConfig } = useDropzone({
        image: {
            maxCount: 1,
            maxFileSize: 1024 * 1024 * 5, // 5MB
            fileTypes: [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
                "image/webp",
            ],
        },
    });

    const cropperRef = useRef<FixedCropperRef>(null);

    const [imageFile, setImageFile] = useState<ExtendedFile | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (uploadEvent: UploadEvent) => {
        const { message, type, data, isError } = processFiles(uploadEvent);

        if (isError) return toast.error(message);
        if (!type) return toast.error("No image is selected!");
        if (!data || !data.images) return toast.error(DEFAULT_ERROR_MESSAGE);

        if (data.rejectedFiles.length > 0)
            toast.error(
                "File rejected: " +
                    data.rejectedFiles[0].file.name +
                    "!, make sure the image is of max " +
                    uploadConfig.image!.maxFileSize / 1024 / 1024 +
                    "MB, and is of " +
                    uploadConfig.image?.fileTypes
                        .map((type) => "'" + type + "'")
                        .join(", ") +
                    " types"
            );

        if (type === "file") setImageFile(data.images[0]);
    };

    const { mutate: handleImageUpdate, isPending: isImageUpdating } =
        useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating...");
                return { toastId };
            },
            mutationFn: async () => {
                if (!imageFile) throw new Error("No image is selected!");

                const cropper = cropperRef.current;
                const croppedImage = cropper?.getCanvas()?.toDataURL();
                if (!croppedImage) throw new Error("No image is selected!");

                const blobBin = atob(croppedImage.split(",")[1]);
                const mimeString = croppedImage
                    .split(",")[0]
                    .split(":")[1]
                    .split(";")[0];
                const ab = new ArrayBuffer(blobBin.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < blobBin.length; i++) {
                    ia[i] = blobBin.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });

                const file = new File(
                    [blob],
                    "pfp_" + user.username + "_" + generateId() + "_crpd.png",
                    {
                        type: mimeString,
                        lastModified: Date.now(),
                    }
                );

                await user.setProfileImage({
                    file,
                });
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Profile picture updated", {
                    id: ctx?.toastId,
                });
                user.reload();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
            onSettled: () => {
                setImageFile(null);
                onClose();
            },
        });

    const { mutate: handleRemoveImage, isPending: isImageRemoving } =
        useMutation({
            onMutate: () => {
                const toastId = toast.loading("Removing...");
                return { toastId };
            },
            mutationFn: async () => {
                const res = await fetch("/preview.png");
                const blob = await res.blob();

                const image = new File(
                    [blob],
                    "pfp_" + user.username + "_" + generateId(),
                    {
                        type: "image/png",
                        lastModified: Date.now(),
                    }
                );

                const formData = new FormData();
                formData.append("image", image);

                await user.setProfileImage({
                    file: image,
                });
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Profile picture removed", {
                    id: ctx?.toastId,
                });
                user.reload();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
            onSettled: () => {
                setImageFile(null);
                onClose();
            },
        });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                setImageFile(null);
            }}
            placement="center"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>Update Profile Picture</ModalHeader>

                        <ModalBody className="gap-5">
                            <div
                                className={cn(
                                    "flex cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-primary/20 p-12 text-center",
                                    isDragging &&
                                        "border-dashed border-primary",
                                    imageFile && "hidden"
                                )}
                                onDragLeave={() => setIsDragging(false)}
                                onDragOver={() => setIsDragging(true)}
                                onDrop={handleUpload}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar
                                    showFallback
                                    src={user.imageUrl}
                                    alt={user.username!}
                                    size="lg"
                                    classNames={{
                                        base: "h-24 w-24",
                                    }}
                                />

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleUpload}
                                    className="hidden"
                                    accept={Object.values(uploadConfig)
                                        .map((config) => config.fileTypes)
                                        .flat()
                                        .join(", ")}
                                />

                                <Button
                                    size="sm"
                                    type="button"
                                    color="secondary"
                                    className="font-semibold"
                                    startContent={
                                        <Icons.upload className="size-4" />
                                    }
                                    onPress={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    Upload Image
                                </Button>
                            </div>

                            <ImageAdjust
                                type="fixed"
                                imageFile={imageFile}
                                preset={"square"}
                                cropperRef={cropperRef}
                                className={cn(!imageFile && "hidden")}
                            />
                        </ModalBody>

                        <ModalFooter>
                            {imageFile ? (
                                <>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => {
                                            setImageFile(null);
                                            URL.revokeObjectURL(imageFile.url);
                                        }}
                                        isDisabled={isImageUpdating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        onPress={() => handleImageUpdate()}
                                        isLoading={isImageUpdating}
                                        isDisabled={
                                            !imageFile || isImageUpdating
                                        }
                                    >
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <div className="w-full space-y-5">
                                    <div className="relative border-b border-white/20">
                                        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-default-50 p-1 px-2 text-xs opacity-80 md:text-sm">
                                            OR
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm opacity-60">
                                            Remove your profile picture
                                        </p>

                                        <Button
                                            size="sm"
                                            color="danger"
                                            onPress={() => handleRemoveImage()}
                                            isLoading={isImageRemoving}
                                            isDisabled={isImageRemoving}
                                        >
                                            Remove Image
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default PfpUploadModal;
