"use client";

import { env } from "@/env.mjs";
import { Icons } from "@/src/components/icons/icons";
import {
    cFetch,
    cn,
    convertSizeIntoRawBytes,
    handleClientError,
} from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { Resume } from "@/src/lib/validation/user";
import { DefaultProps, UploadFileResponse } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, Progress } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useUploadThing } from "../../../ui/uploadthing";
import ResumePreview from "./resume-preview";

const socket = io(env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
    autoConnect: true,
});

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileResume({ className, user, ...props }: PageProps) {
    const router = useRouter();

    const [resume, setResume] = useState<Resume>(user.publicMetadata.resume);
    const [progress, setProgress] = useState(0);
    const [event, setEvent] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const { permittedFileInfo } = useUploadThing("resumeUpload");

    const { mutate: startUpload, isLoading: isUploading } = useMutation({
        mutationFn: async (files: File[]) => {
            const file = files[0];

            const formData = new FormData();
            formData.append("file", file);
            formData.append("uploaderId", user.id);

            const res = await cFetch<ResponseData<UploadFileResponse>>(
                "/api/uploads/pdf",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (res.message !== "OK") throw new Error(res.longMessage);
            if (!res.data) throw new Error("No data returned");

            return res.data;
        },
        onSuccess: (data) => {
            setResume({
                name: data.name,
                url: data.url,
                size: data.size,
                key: data.key,
            });
            toast.success("Resume uploaded successfully");

            setProgress(0);
            setEvent("Waiting for file...");

            router.refresh();
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    useEffect(() => {
        socket.on(
            "pdf_upload_progress",
            (data: { progress: number; message: string }) => {
                setProgress(data.progress);
                setEvent(data.message);
            }
        );

        return () => {
            socket.off("pdf_upload_progress");
        };
    }, []);

    const fileTypes = permittedFileInfo?.config
        ? Object.keys(permittedFileInfo?.config)
        : [];

    return (
        <div className={cn("space-y-4", className)} {...props}>
            <p className="text-xl font-semibold">Resume</p>

            <Dropzone
                disabled={isUploading}
                maxFiles={1}
                maxSize={convertSizeIntoRawBytes(
                    permittedFileInfo?.config.pdf?.maxFileSize ?? "1MB"
                )}
                onDragEnter={() => setIsDragActive(true)}
                onDragLeave={() => setIsDragActive(false)}
                onDropAccepted={(files) => {
                    setIsDragActive(false);
                    startUpload(files);
                }}
                onDropRejected={(fileRejections) => {
                    return toast.error(fileRejections[0].errors[0].message);
                }}
                accept={
                    fileTypes && fileTypes.length
                        ? generateClientDropzoneAccept(fileTypes)
                        : undefined
                }
            >
                {({ getRootProps, getInputProps, open }) => (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "flex min-h-[15rem] w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-black/20 bg-default-50 p-3 text-center dark:border-white/20 md:p-12",
                            isDragActive && "bg-sky-900"
                        )}
                    >
                        <input {...getInputProps()} />

                        {isUploading ? (
                            <div className="w-1/2 space-y-1">
                                <Progress
                                    radius="sm"
                                    showValueLabel
                                    value={progress}
                                    label="Uploading"
                                />

                                <p className="text-sm opacity-80">{event}</p>
                            </div>
                        ) : !resume ? (
                            <div className="flex flex-col items-center gap-2">
                                <Button
                                    className="font-semibold"
                                    radius="sm"
                                    variant="shadow"
                                    startContent={
                                        <Icons.upload className="h-4 w-4" />
                                    }
                                    onPress={open}
                                    isDisabled={isUploading}
                                    isLoading={isUploading}
                                >
                                    Upload Resume
                                </Button>
                            </div>
                        ) : (
                            <ResumePreview resume={resume} />
                        )}
                    </div>
                )}
            </Dropzone>
        </div>
    );
}

export default ProfileResume;
