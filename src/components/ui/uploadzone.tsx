"use client";

import { cn, convertBytesIntoHumanReadable } from "@/src/lib/utils";
import { Button, Progress } from "@nextui-org/react";
import { JSX, useState } from "react";
import Dropzone, { DropzoneProps } from "react-dropzone";
import toast from "react-hot-toast";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Icons } from "../icons/icons";

export interface UploadZoneProps extends DropzoneProps {
    isUploading: boolean;
    uploadProgress: number;
    fileTypes: string[];
    maxFiles?: number;
    maxFileSize?: number;
    isDisabled?: boolean;
    content?: JSX.Element | null;
    className?: string;
    isButtonVisible?: boolean;
}

function UploadZone({
    isUploading,
    fileTypes,
    maxFiles,
    maxFileSize,
    isDisabled,
    uploadProgress,
    content,
    className,
    isButtonVisible = true,
    ...props
}: UploadZoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    return (
        <Dropzone
            disabled={isUploading || isDisabled}
            maxFiles={maxFiles || 1}
            maxSize={maxFileSize || 10 * 1024 * 1024}
            onDragEnter={() => setIsDragActive(true)}
            onDragLeave={() => setIsDragActive(false)}
            onDropAccepted={() => setIsDragActive(false)}
            onDropRejected={(fileRejections) => {
                return toast.error(fileRejections[0].errors[0].message);
            }}
            accept={
                fileTypes && fileTypes.length
                    ? generateClientDropzoneAccept(fileTypes)
                    : undefined
            }
            {...props}
        >
            {({ getRootProps, getInputProps, open }) => (
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex min-h-[15rem] w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-black/20 bg-default-50 p-3 text-center dark:border-white/20 md:p-12",
                        className,
                        isDragActive && "bg-sky-900"
                    )}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <div className="w-1/2">
                            <Progress
                                radius="sm"
                                showValueLabel
                                value={uploadProgress}
                                label="Uploading"
                            />
                        </div>
                    ) : (
                        content ?? (
                            <p className="text-sm opacity-80">
                                Drop your image here
                            </p>
                        )
                    )}

                    {!isUploading && isButtonVisible && (
                        <div className="flex flex-col items-center gap-2">
                            <Button
                                type="button"
                                className="font-semibold"
                                radius="sm"
                                variant="shadow"
                                startContent={
                                    !isUploading && (
                                        <Icons.upload className="h-4 w-4" />
                                    )
                                }
                                onPress={open}
                                isDisabled={isUploading || isDisabled}
                                isLoading={isUploading}
                            >
                                Upload{" "}
                                {fileTypes.includes("application/pdf")
                                    ? "PDF"
                                    : fileTypes.includes("image/*")
                                      ? "Image"
                                      : fileTypes.includes("video/*")
                                        ? "Video"
                                        : fileTypes.includes("audio/*")
                                          ? "Audio"
                                          : "File"}
                            </Button>

                            <p className="text-xs text-gray-400">
                                (
                                {convertBytesIntoHumanReadable(
                                    maxFileSize || 10 * 1024 * 1024
                                ) || "Loading..."}
                                )
                            </p>
                        </div>
                    )}
                </div>
            )}
        </Dropzone>
    );
}

export default UploadZone;
