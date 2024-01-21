"use client";

import { Icons } from "@/src/components/icons/icons";
import { useSocket } from "@/src/components/providers/socket";
import { SOCKET_EVENTS } from "@/src/config/enums";
import { useDropzone } from "@/src/hooks/useDropzone";
import { cFetch, cn, handleClientError } from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { Resume } from "@/src/lib/validation/user";
import { DefaultProps, UploadEvent, UploadFileResponse } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, Progress } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ResumePreview from "./resume-preview";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileResume({ className, user, ...props }: PageProps) {
    const router = useRouter();
    const { socket } = useSocket();
    const { processFiles, uploadConfig } = useDropzone({
        file: {
            maxCount: 1,
            maxFileSize: 1024 * 512, // 512KB
            fileTypes: ["application/pdf"],
        },
    });

    const [resume, setResume] = useState<Resume>(user.publicMetadata.resume);
    const [progress, setProgress] = useState(0);
    const [event, setEvent] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const { mutate: startUpload, isPending: isUploading } = useMutation({
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
        if (!socket) return;

        socket.on(
            SOCKET_EVENTS.PDF_UPLOAD_PROGRESS,
            (data: { progress: number; message: string }) => {
                setProgress(data.progress);
                setEvent(data.message);
            }
        );

        return () => {
            socket.off(SOCKET_EVENTS.PDF_UPLOAD_PROGRESS);
        };
    }, [socket]);

    const handleUpload = (uploadEvent: UploadEvent) => {
        const { message, type, data, isError } = processFiles(uploadEvent);

        if (isError) return toast.error(message);
        if (!type) return toast.error("No file selected");
        if (!data || !data.others) return toast.error("No file selected");

        if (data.rejectedFiles.length > 0)
            toast.error(
                "File rejected: " +
                    data.rejectedFiles[0].file.name +
                    "!, make sure the pdf is of max " +
                    uploadConfig.file!.maxFileSize / 1024 / 1024 +
                    "MB, and is of " +
                    uploadConfig.file?.fileTypes
                        .map((type) => "'" + type + "'")
                        .join(", ") +
                    " types"
            );

        if (type === "file") startUpload(data.others.map((file) => file.file));
    };

    return (
        <div className={cn("space-y-4", className)} {...props}>
            <p className="text-xl font-semibold">Resume</p>

            <div
                className={cn(
                    "flex min-h-[15rem] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-black/20 bg-default-50 p-3 text-center dark:border-white/20 md:p-12",
                    isDragActive && "bg-sky-900"
                )}
                onDragLeave={() => setIsDragActive(false)}
                onDragOver={() => setIsDragActive(true)}
                onDrop={handleUpload}
                onClick={() => fileInputRef.current?.click()}
            >
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
                            startContent={<Icons.upload className="size-4" />}
                            onPress={() => fileInputRef.current?.click()}
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
        </div>
    );
}

export default ProfileResume;
