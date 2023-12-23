"use client";

import { Icons } from "@/src/components/icons/icons";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button } from "@nextui-org/react";
import NextImage from "next/image";
import { Dispatch, SetStateAction } from "react";

interface PageProps extends DefaultProps {
    uploadedImages: ExtendedFile[];
    setUploadedImages: Dispatch<SetStateAction<ExtendedFile[]>>;
    setEditingImage: Dispatch<SetStateAction<ExtendedFile | null>>;
}

function ImageView({
    className,
    uploadedImages,
    setUploadedImages,
    setEditingImage,
    ...props
}: PageProps) {
    return (
        <div className={cn("grid grid-cols-2 gap-2", className)} {...props}>
            {uploadedImages.map(({ file, id, url }) => (
                <div
                    key={id}
                    className="relative aspect-video overflow-hidden rounded-lg"
                >
                    <NextImage
                        src={url}
                        alt={file.name}
                        width={320}
                        height={180}
                    />

                    <div className="absolute top-0 z-10 w-full">
                        <div className="flex items-center justify-between p-2">
                            <Button
                                isIconOnly
                                radius="full"
                                size="sm"
                                variant="shadow"
                                className="h-6 w-6 min-w-0"
                                startContent={
                                    <Icons.pencil className="h-[14px] w-[14px]" />
                                }
                                onPress={() =>
                                    setEditingImage({
                                        id,
                                        file,
                                        url,
                                    })
                                }
                            />

                            <Button
                                isIconOnly
                                radius="full"
                                size="sm"
                                variant="shadow"
                                className="h-6 w-6 min-w-0"
                                startContent={
                                    <Icons.close className="h-[14px] w-[14px]" />
                                }
                                onPress={() => {
                                    setUploadedImages(
                                        uploadedImages.filter(
                                            (image) => image.id !== id
                                        )
                                    );

                                    URL.revokeObjectURL(url);
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ImageView;
