"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { cn, handleClientError } from "@/src/lib/utils";
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
import "cropperjs/dist/cropper.css";
import { nanoid } from "nanoid";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import Dropzone from "react-dropzone";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";

interface PfpUploadModalProps {
    user: UserResource;
    setIconURL: Dispatch<SetStateAction<string>>;
    iconURL: string;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function PfpUploadModal({
    user,
    setIconURL,
    iconURL,
    onClose,
    isOpen,
    onOpenChange,
}: PfpUploadModalProps) {
    const cropperRef = useRef<ReactCropperElement>(null);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFileUpload = (file: File) => {
        setSelectedImage(URL.createObjectURL(file));
        toast.success("Image uploaded");
    };

    const handleCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return toast.error(DEFAULT_ERROR_MESSAGE);

        const croppedImage = cropper.getCroppedCanvas().toDataURL();

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
        const newFile = new Blob([ab], { type: mimeString });

        const file = new File(
            [newFile],
            "pfp_" + user.username + "_" + nanoid(),
            {
                type: mimeString,
                lastModified: Date.now(),
            }
        );

        setImageFile(file);
    };

    const { mutate: handleImageUpdate, isPending: isImageUpdating } =
        useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating...");
                return { toastId };
            },
            mutationFn: async () => {
                if (!imageFile) throw new Error("No image is selected!");

                const formData = new FormData();
                formData.append("image", imageFile);

                await user.setProfileImage({
                    file: imageFile,
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
                setSelectedImage(null);
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
                    "pfp_" + user.username + "_" + nanoid(),
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
                setSelectedImage(null);
                onClose();
            },
        });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                setSelectedImage(null);
                setImageFile(null);
                setIconURL(user.imageUrl);
            }}
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Update Profile Picture</ModalHeader>

                        <ModalBody className="gap-5">
                            {!selectedImage ? (
                                <>
                                    <Dropzone
                                        onDrop={(acceptedFiles) =>
                                            handleFileUpload(acceptedFiles[0])
                                        }
                                        accept={{
                                            "image/png": [".png"],
                                            "image/jpeg": [".jpeg"],
                                            "image/jpg": [".jpg"],
                                        }}
                                        maxFiles={1}
                                        onDragEnter={() =>
                                            setIsDragActive(true)
                                        }
                                        onDragLeave={() =>
                                            setIsDragActive(false)
                                        }
                                        onDropAccepted={() =>
                                            setIsDragActive(false)
                                        }
                                        maxSize={2 * 1024 * 1024}
                                        onDropRejected={(fileRejections) =>
                                            toast.error(
                                                fileRejections[0].errors[0]
                                                    .message
                                            )
                                        }
                                    >
                                        {({
                                            getRootProps,
                                            getInputProps,
                                            open,
                                        }) => (
                                            <div
                                                {...getRootProps()}
                                                className={cn(
                                                    "flex w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-gray-500 bg-background p-12 text-center md:gap-7",
                                                    isDragActive && "bg-sky-900"
                                                )}
                                            >
                                                <Avatar
                                                    showFallback
                                                    src={iconURL}
                                                    alt={user.username!}
                                                    size="lg"
                                                    classNames={{
                                                        base: "h-24 w-24",
                                                    }}
                                                />

                                                <input {...getInputProps()} />

                                                <p className="text-sm md:text-base">
                                                    Drag & drop your image here
                                                </p>

                                                <Button
                                                    size="sm"
                                                    type="button"
                                                    color="secondary"
                                                    className="font-semibold"
                                                    startContent={
                                                        <Icons.upload className="h-4 w-4" />
                                                    }
                                                    onPress={open}
                                                >
                                                    Upload Image
                                                </Button>
                                            </div>
                                        )}
                                    </Dropzone>
                                </>
                            ) : (
                                <Cropper
                                    src={selectedImage}
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                    }}
                                    initialAspectRatio={1 / 1}
                                    aspectRatio={1 / 1}
                                    guides={true}
                                    crop={handleCrop}
                                    ref={cropperRef}
                                />
                            )}
                        </ModalBody>

                        <ModalFooter>
                            {selectedImage ? (
                                <>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={close}
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
                                        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-default-50 p-1 px-2 text-sm opacity-80">
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
