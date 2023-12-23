import { IncomingHttpHeaders } from "http";
import { HTMLAttributes, ReactNode } from "react";
import { WebhookRequiredHeaders } from "svix";
import { Icons } from "../components/icons/icons";
import {
    Education,
    Resume,
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

export type CategoryProps = {
    label: string;
    value: string;
};

declare global {
    interface UserPublicMetadata {
        bio: string | null;
        type: UserType;
        category: UserCategoryType;
        gender: UserGenderType;
        socials: UserSocial[];
        isVerified: boolean;
        resume: Resume | null;
        education: Education[];
        usernameChangedAt: number;
    }

    interface ExtendedFile {
        id: string;
        url: string;
        file: File;
    }
}

export type UploadFileResponse = {
    key: string;
    url: string;
    name: string;
    size: number;
};
