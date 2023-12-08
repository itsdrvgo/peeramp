"use client";

import {
    cn,
    convertSizeIntoRawBytes,
    handleClientError,
} from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUploadThing } from "../../ui/uploadthing";
import UploadZone from "../../ui/uploadzone";
import ResumePreview from "./resume-preview";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileResume({ className, user, ...props }: PageProps) {
    const router = useRouter();

    const [resume, setResume] = useState(user.publicMetadata.resume?.key);
    const [progress, setProgress] = useState(0);

    const { permittedFileInfo, isUploading, startUpload } = useUploadThing(
        "resumeUpload",
        {
            onUploadBegin: () => {
                toast.success("Your resume will be uploaded shortly");
            },
            onUploadProgress: (p) => {
                setProgress(p);
            },
            onUploadError: (e) => {
                handleClientError(e);
            },
            onClientUploadComplete: (res) => {
                if (!res) return toast.error("Something went wrong!");
                const upload = res[0];

                if (!upload || Object.keys(upload).length === 0)
                    return toast.error("Something went wrong!");

                router.refresh();
                setResume(upload.key);
                toast.success("Your resume has been uploaded");
            },
        }
    );

    const fileTypes = permittedFileInfo?.config
        ? Object.keys(permittedFileInfo?.config)
        : [];

    return (
        <div className={cn("space-y-4", className)} {...props}>
            <p className="text-xl font-semibold">Resume</p>

            <UploadZone
                fileTypes={fileTypes}
                maxFiles={convertSizeIntoRawBytes(
                    permittedFileInfo?.config.pdf?.maxFileSize ?? "1MB"
                )}
                uploadProgress={progress}
                isUploading={isUploading}
                maxFileSize={convertSizeIntoRawBytes(
                    permittedFileInfo?.config.pdf?.maxFileSize ?? "1MB"
                )}
                content={
                    resume ? (
                        <ResumePreview fileKey={resume} />
                    ) : (
                        <p className="text-sm">Upload your resume here</p>
                    )
                }
                isButtonVisible={!resume}
                onDropAccepted={(files) => startUpload(files)}
            />
        </div>
    );
}

export default ProfileResume;
