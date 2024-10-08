import { init } from "@paralleldrive/cuid2";
import { clsx, type ClassValue } from "clsx";
import { DrizzleError } from "drizzle-orm";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Icons } from "../components/icons/icons";
import { DEFAULT_ERROR_MESSAGE } from "../config/const";
import { ResponseMessages } from "./validation/response";
import { userCategoriesSchema, UserSocialType } from "./validation/user";

export const generateId = init({
    length: 16,
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export function handleError(err: unknown) {
    console.error(err);
    if (err instanceof ZodError)
        return CResponse({
            message: "UNPROCESSABLE_ENTITY",
            longMessage: err.issues.map((x) => x.message).join(", "),
        });
    else if (err instanceof DrizzleError)
        return CResponse({
            message: "UNKNOWN_ERROR",
            longMessage: err.message,
        });
    else
        return CResponse({
            message: "UNKNOWN_ERROR",
            longMessage: (err as Error).message,
        });
}

export function shortenNumber(num: number): string {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;
    while (num >= 1000 && unitIndex < units.length - 1) {
        num /= 1000;
        unitIndex++;
    }
    const formattedNum = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return formattedNum + units[unitIndex];
}

export async function cFetch<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);
    const data = await res.json();
    return data;
}

export function CResponse<T>({
    message,
    longMessage,
    data,
}: {
    message: ResponseMessages;
    longMessage?: string;
    data?: T;
}) {
    let code: number;

    switch (message) {
        case "OK":
            code = 200;
            break;
        case "ERROR":
            code = 400;
            break;
        case "UNAUTHORIZED":
            code = 401;
            break;
        case "FORBIDDEN":
            code = 403;
            break;
        case "NOT_FOUND":
            code = 404;
            break;
        case "BAD_REQUEST":
            code = 400;
            break;
        case "TOO_MANY_REQUESTS":
            code = 429;
            break;
        case "INTERNAL_SERVER_ERROR":
            code = 500;
            break;
        case "SERVICE_UNAVAILABLE":
            code = 503;
            break;
        case "GATEWAY_TIMEOUT":
            code = 504;
            break;
        case "UNKNOWN_ERROR":
            code = 500;
            break;
        case "UNPROCESSABLE_ENTITY":
            code = 422;
            break;
        case "NOT_IMPLEMENTED":
            code = 501;
            break;
        case "CREATED":
            code = 201;
            break;
        case "BAD_GATEWAY":
            code = 502;
            break;
        default:
            code = 500;
            break;
    }

    return NextResponse.json({
        code,
        message,
        longMessage,
        data,
    });
}

export function handleClientError(error: unknown, toastId?: string) {
    if (error instanceof DrizzleError) {
        return toast.error(error.message, {
            id: toastId,
        });
    } else if (error instanceof ZodError) {
        return toast.error(error.issues.map((x) => x.message).join(", "), {
            id: toastId,
        });
    } else if (error instanceof Error) {
        return toast.error(error.message, {
            id: toastId,
        });
    } else {
        console.error(error);
        return toast.error(DEFAULT_ERROR_MESSAGE, {
            id: toastId,
        });
    }
}

export function getUserCategory(categoryKey: string) {
    const category = userCategoriesSchema.parse(categoryKey);
    switch (category) {
        case "frontend":
            return "Frontend Developer";
        case "backend":
            return "Backend Developer";
        case "fullstack":
            return "Fullstack Developer";
        case "devops":
            return "DevOps Engineer";
        case "designer":
            return "Designer";
        case "data":
            return "Data Scientist";
        case "product":
            return "Product Manager";
        case "game":
            return "Game Developer";
        default:
            return "Prefer not to say";
    }
}

export function getIconForConnection(connection: UserSocialType) {
    let icon: keyof typeof Icons;

    switch (connection) {
        case "discord":
            icon = "discord";
            break;
        case "facebook":
            icon = "facebook";
            break;
        case "github":
            icon = "github";
            break;
        case "instagram":
            icon = "instagram";
            break;
        case "linkedin":
            icon = "linkedin";
            break;
        case "x":
            icon = "x";
            break;
        case "spotify":
            icon = "spotify";
            break;
        case "twitch":
            icon = "twitch";
            break;
        case "youtube":
            icon = "youtube";
            break;
        case "website":
            icon = "globe";
            break;
        case "tiktok":
            icon = "tiktok";
            break;
        default:
            icon = "link";
            break;
    }

    return icon;
}

export function getColorForConnection(connection: UserSocialType) {
    let color:
        | "primary"
        | "success"
        | "danger"
        | "warning"
        | "secondary"
        | "default";

    switch (connection) {
        case "youtube":
            color = "danger";
            break;
        case "instagram":
            color = "warning";
            break;
        case "discord":
            color = "secondary";
            break;
        case "facebook":
            color = "primary";
            break;
        case "linkedin":
            color = "primary";
            break;
        case "spotify":
            color = "success";
            break;
        case "twitch":
            color = "secondary";
            break;
        case "website":
            color = "primary";
            break;
        default:
            color = "default";
            break;
    }

    return color;
}

export function convertMstoTimeElapsed(input: number) {
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - input;

    if (elapsed < 60000) return "just now";
    else if (elapsed < 3600000) {
        const minutes = Math.floor(elapsed / 60000);
        return `${minutes}m`;
    } else if (elapsed < 86400000) {
        const hours = Math.floor(elapsed / 3600000);
        return `${hours}h`;
    } else {
        const date = new Date(input);
        const currentDate = new Date();
        const isSameYear = date.getFullYear() === currentDate.getFullYear();
        const month = date.toLocaleString("default", { month: "short" });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}${isSameYear ? "" : `, ${year}`}`;
    }
}

export function convertBytesIntoHumanReadable(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes === 0) {
        return "0 Byte";
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export function convertSizeIntoRawBytes(
    size:
        | "2B"
        | "2KB"
        | "2MB"
        | "2GB"
        | "1B"
        | "1KB"
        | "1MB"
        | "1GB"
        | "4B"
        | "4KB"
        | "4MB"
        | "4GB"
        | "32B"
        | "32KB"
        | "32MB"
        | "32GB"
        | "8B"
        | "8KB"
        | "8MB"
        | "8GB"
        | "16B"
        | "16KB"
        | "16MB"
        | "16GB"
        | "64B"
        | "64KB"
        | "64MB"
        | "64GB"
        | "128B"
        | "128KB"
        | "128MB"
        | "128GB"
        | "256B"
        | "256KB"
        | "256MB"
        | "256GB"
        | "512B"
        | "512KB"
        | "512MB"
        | "512GB"
        | "1024B"
        | "1024KB"
        | "1024MB"
        | "1024GB"
) {
    const sizes = ["B", "KB", "MB", "GB"];
    const sizeNumber = parseInt(size.slice(0, -1));
    const match = size.match(/\D+$/);
    const sizeUnit = match ? match[0] : "";

    if (sizeUnit === "B") {
        return sizeNumber;
    } else {
        const i = sizes.indexOf(sizeUnit);
        return sizeNumber * Math.pow(1024, i);
    }
}

export function extractYTVideoId(url: string) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    return params.get("v");
}

export function isYouTubeVideo(url: string) {
    const regex =
        /https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return regex.test(url);
}
