"use client";

import { Preset } from "@/src/lib/validation/image";
import { Button } from "@nextui-org/react";
import { nanoid } from "nanoid";
import { Dispatch, RefObject, SetStateAction } from "react";
import { FixedCropperRef } from "react-advanced-cropper";

interface PageProps {
    cropperRef: RefObject<FixedCropperRef>;
    userId: string;
    uploadedImages: ExtendedFile[];
    editingImage: ExtendedFile | null;
    setPreset: Dispatch<SetStateAction<Preset>>;
    setUploadedImages: Dispatch<SetStateAction<ExtendedFile[]>>;
    setEditingImage: Dispatch<SetStateAction<ExtendedFile | null>>;
}

function ImageAdjustButtons({
    cropperRef,
    userId,
    uploadedImages,
    editingImage,
    setPreset,
    setUploadedImages,
    setEditingImage,
}: PageProps) {
    const handleCrop = () => {
        const cropper = cropperRef.current;
        const croppedImage = cropper?.getCanvas()?.toDataURL();
        if (croppedImage) {
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
                editingImage?.file.name ??
                    nanoid() + "_" + userId + "_" + Date.now() + "_crpd.png",
                {
                    type: mimeString,
                    lastModified: Date.now(),
                }
            );

            setEditingImage(null);
            setPreset("square");
            setUploadedImages(
                uploadedImages.map((uploadedImage) =>
                    uploadedImage.id === editingImage?.id
                        ? {
                              id: uploadedImage.id,
                              file,
                              url: URL.createObjectURL(file),
                          }
                        : uploadedImage
                )
            );
        }
    };

    return (
        <>
            <Button
                radius="sm"
                className="font-semibold"
                onPress={() => {
                    setEditingImage(null);
                    setPreset("square");
                }}
            >
                Cancel
            </Button>

            <Button
                radius="sm"
                color="primary"
                className="font-semibold dark:text-black"
                onPress={handleCrop}
            >
                Done
            </Button>
        </>
    );
}

export default ImageAdjustButtons;
