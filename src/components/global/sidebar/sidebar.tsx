import { siteConfig } from "@/src/config/site";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { Icons } from "../../icons/icons";
import PeerAmp from "../svgs/PeerAmp";
import MoreTab from "./more-tab";
import ProfileTab from "./profile-tab";

interface Item {
    icon: keyof typeof Icons;
    label: string;
    href: string;
}

const items: Item[] = [
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

function Sidebar({ className, children, ...props }: DefaultProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            <aside
                className={cn(
                    "flex h-screen w-80 flex-col justify-between border-r border-black/10 p-3 py-8 dark:border-white/10",
                    className
                )}
                {...props}
            >
                <div className="space-y-10">
                    <Link
                        as={NextLink}
                        href="/"
                        color="foreground"
                        className="flex items-center gap-1 px-3"
                    >
                        <PeerAmp />
                        <span className="text-2xl font-semibold">
                            {siteConfig.name}
                        </span>
                    </Link>

                    <nav className="flex flex-col gap-1">
                        {items.map((item, index) => {
                            const Icon = Icons[item.icon];

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center gap-4 rounded-lg p-4 px-3 hover:bg-default-100"
                                    color="foreground"
                                >
                                    <Icon className="h-6 w-6" />
                                    <p>{item.label}</p>
                                </Link>
                            );
                        })}

                        <MoreTab />
                    </nav>
                </div>

                <ProfileTab />
            </aside>
            {children}
        </div>
    );
}

export default Sidebar;
