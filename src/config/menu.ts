import { AsideNavItem, MenuConfig } from "../types";

export const menuConfig: MenuConfig = [
    {
        title: "About Us",
        href: "/about",
    },
    {
        title: "Contact",
        href: "/contact",
    },
    {
        title: "Become a Mentor",
        href: "/signup?type=mentor",
    },
    {
        title: "Pro",
        href: "/membership",
    },
];

export const asideMenuConfig: AsideNavItem[] = [
    {
        icon: "home",
        label: "Home",
        href: "/",
    },
    {
        icon: "search",
        label: "Search",
        href: "/search",
    },
    {
        icon: "compass",
        label: "Explore",
        href: "/explore",
    },
    {
        icon: "messages",
        label: "Messages",
        href: "/messages",
    },
];
