import { IncomingHttpHeaders } from "http";
import { HTMLAttributes, ReactNode } from "react";
import { WebhookRequiredHeaders } from "svix";
import { Icons } from "../components/icons/icons";
import {
    UserCategoryType,
    UserGenderType,
    UserSocial,
    UserType,
} from "../lib/validation/user";

export type SiteConfig = {
    name: string;
    description: string;
    topLevelDomain: string;
    url: string;
    ogImage: string;
    keywords: string[];
    links: {
        youtube: string;
        instagram: string;
        twitter: string;
        github: string;
        discord: string;
    };
};

export type SvixHeaders = IncomingHttpHeaders & WebhookRequiredHeaders;
export type DefaultProps = HTMLAttributes<HTMLElement>;
export interface RootLayoutProps {
    children: ReactNode;
}

export type NavItem = {
    title: string;
    description?: string;
    href: string;
    disabled?: boolean;
    icon?: keyof typeof Icons;
};

export type AsideNavItem = {
    icon: keyof typeof Icons;
    label: string;
    href: string;
};

export type MenuConfig = NavItem[];

export const ResponseMessagesEnum = {
    OK: "OK",
    ERROR: "ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    FORBIDDEN: "FORBIDDEN",
    NOT_FOUND: "NOT_FOUND",
    BAD_REQUEST: "BAD_REQUEST",
    TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
    INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY",
    NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
    CREATED: "CREATED",
    BAD_GATEWAY: "BAD_GATEWAY",
};

export type ResponseMessages = keyof typeof ResponseMessagesEnum;

declare global {
    interface UserPublicMetadata {
        bio: string | null;
        type: UserType;
        category: UserCategoryType;
        gender: UserGenderType;
        socials: UserSocial[];
        usernameChangedAt: number;
    }
}

export type Visibility = "everyone" | "following" | "peers" | "only-me";
export type Status = "draft" | "published";
