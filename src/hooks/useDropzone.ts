import { ChangeEvent, ClipboardEvent, DragEvent } from "react";
import { ACCEPTED_FILE_TYPES } from "../config/const";
import { FileReturnType, UploadEvent } from "../types";

const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
    maxCount: 1,
    maxFileSize: 5 * 1024 * 1024,
    fileTypes: ACCEPTED_FILE_TYPES,
};

type UploadConfig = {
    maxCount: number;
    maxFileSize: number;
    fileTypes: string[];
};

type DropzoneProps = {
    image?: UploadConfig;
    video?: UploadConfig;
    file?: UploadConfig;
};

export function useDropzone(
    props: DropzoneProps = {
        image: DEFAULT_UPLOAD_CONFIG,
        video: DEFAULT_UPLOAD_CONFIG,
        file: DEFAULT_UPLOAD_CONFIG,
    }
) {
    const processFiles = (e: UploadEvent): FileReturnType => {
        if (e.type === "drop")
            return handleDrop(e as DragEvent<HTMLDivElement>);
        else if (e.type === "paste")
            return handlePaste(e as ClipboardEvent<HTMLDivElement>);
        else return handleInputChange(e as ChangeEvent<HTMLInputElement>);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>): FileReturnType => {
        event.preventDefault();

        const files = event.dataTransfer.files;
        if (!files)
            return {
                status: "idle",
                message: "",
                isError: false,
                isSuccess: false,
            };
        const isUploadAcceptable = isFileTypeAllowed(
            files,
            Object.values(props)
                .map((value) => value.fileTypes)
                .flat()
        );
        if (!isUploadAcceptable)
            return {
                status: "error",
                message:
                    "Unsupported file types. Only " +
                    Object.values(props)
                        .map((value) =>
                            value.fileTypes.map((type) => "'" + type + "'")
                        )
                        .flat()
                        .join(", ") +
                    " files are allowed!",
                isError: true,
                isSuccess: false,
            };

        return handleUploadedFiles(files);
    };

    const handlePaste = (
        event: ClipboardEvent<HTMLDivElement>
    ): FileReturnType => {
        event.preventDefault();

        const files = event.clipboardData.files;
        const text = event.clipboardData.getData("text/plain");

        if (!files && !text)
            return {
                status: "idle",
                message: "",
                isError: false,
                isSuccess: false,
            };

        if (text)
            return {
                status: "success",
                type: "text",
                message: text,
                isSuccess: true,
                isError: false,
            };

        const isUploadAcceptable = isFileTypeAllowed(
            files,
            Object.values(props)
                .map((value) => value.fileTypes)
                .flat()
        );
        if (!isUploadAcceptable)
            return {
                status: "error",
                message:
                    "Unsupported file types. Only " +
                    Object.values(props)
                        .map((value) =>
                            value.fileTypes.map((type) => "'" + type + "'")
                        )
                        .flat()
                        .join(", ") +
                    " files are allowed!",
                isError: true,
                isSuccess: false,
            };

        return handleUploadedFiles(files);
    };

    const handleInputChange = (
        event: ChangeEvent<HTMLInputElement>
    ): FileReturnType => {
        event.preventDefault();

        const files = event.target.files;
        if (!files || files.length === 0)
            return {
                status: "idle",
                message: "",
                isError: false,
                isSuccess: false,
            };

        const isUploadAcceptable = isFileTypeAllowed(
            files,
            Object.values(props)
                .map((value) => value.fileTypes)
                .flat()
        );
        if (!isUploadAcceptable)
            return {
                status: "error",
                message:
                    "Unsupported file types. Only " +
                    Object.values(props)
                        .map((value) =>
                            value.fileTypes.map((type) => "'" + type + "'")
                        )
                        .flat()
                        .join(", ") +
                    " files are allowed!",
                isError: true,
                isSuccess: false,
            };

        return handleUploadedFiles(files);
    };

    const handleUploadedFiles = (files: FileList): FileReturnType => {
        const images: ExtendedFile[] = [];
        const videos: ExtendedFile[] = [];
        const others: ExtendedFile[] = [];

        const rejectedFiles: ExtendedFile[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let fileAccepted = false;

            if (props.image) {
                if (
                    props.image.fileTypes.includes(file.type) &&
                    file.size <= props.image.maxFileSize &&
                    images.length <= props.image.maxCount
                ) {
                    images.push({
                        id: file.name,
                        file,
                        url: URL.createObjectURL(file),
                    });
                    fileAccepted = true;
                }
            }

            if (props.video) {
                if (
                    props.video.fileTypes.includes(file.type) &&
                    file.size <= props.video.maxFileSize &&
                    videos.length <= props.video.maxCount
                ) {
                    videos.push({
                        id: file.name,
                        file,
                        url: URL.createObjectURL(file),
                    });
                    fileAccepted = true;
                }
            }

            if (props.file) {
                if (
                    props.file.fileTypes.includes(file.type) &&
                    file.size <= props.file.maxFileSize &&
                    others.length <= props.file.maxCount
                ) {
                    others.push({
                        id: file.name,
                        file,
                        url: URL.createObjectURL(file),
                    });
                    fileAccepted = true;
                }
            }

            if (!fileAccepted) {
                rejectedFiles.push({
                    id: file.name,
                    file,
                    url: URL.createObjectURL(file),
                });
            }
        }

        return {
            status: "success",
            isError: false,
            isSuccess: true,
            message: "Files" + (files.length > 1 ? "s" : "") + " uploaded",
            type: "file",
            data: {
                images,
                videos,
                others,
                rejectedFiles,
            },
        };
    };

    return {
        processFiles,
        uploadConfig: props,
    };
}

function isFileTypeAllowed(files: FileList, acceptedTypes: string[]) {
    const isAllowed =
        files.length > 0 &&
        Array.from(files).every((file) => acceptedTypes.includes(file.type));
    return isAllowed;
}
