import { clsx, type ClassValue } from "clsx";
import { DrizzleError } from "drizzle-orm";
import { NextResponse } from "next/server";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Icons } from "../components/icons/icons";
import { DEFAULT_ERROR_MESSAGE } from "../config/const";
import { ResponseMessages } from "../types";
import { userCategoriesSchema, UserSocialType } from "./validation/user";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export function handleError(err: unknown) {
    console.error(err);
    if (err instanceof ZodError)
        return NextResponse.json({
            code: 422,
            message: err.issues.map((x) => x.message).join(", "),
        });
    else if (err instanceof DrizzleError)
        return NextResponse.json({
            code: 500,
            message: err.message,
        });
    else return CResponse({ message: "UNKNOWN_ERROR" });
}

export function getTheme() {
    if (typeof window === "undefined" || typeof localStorage === "undefined")
        return "light";
    return (localStorage.getItem("theme") as "dark" | "light") ?? "light";
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

export function CResponse({
    message,
    data,
}: {
    message: ResponseMessages;
    data?: unknown;
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
        data: JSON.stringify(data),
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
