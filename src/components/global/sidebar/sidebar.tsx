import { asideMenuConfig } from "@/src/config/menu";
import { siteConfig } from "@/src/config/site";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button, Link } from "@nextui-org/react";
import NextLink from "next/link";
import { Icons } from "../../icons/icons";
import PeerAmp from "../svgs/PeerAmp";
import AmpCreateTab from "./amp-create-tab";
import MoreTab from "./more-tab";
import ProfileTab from "./profile-tab";

function Sidebar({ className, children, ...props }: DefaultProps) {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden md:flex-row">
            <aside
                className={cn(
                    "hidden h-screen w-80 flex-col justify-between border-r border-black/10 p-3 py-8 dark:border-white/10 md:flex",
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
                        {asideMenuConfig.map((item, index) => {
                            const Icon = Icons[item.icon];

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center gap-4 rounded-lg p-4 px-3 hover:bg-default-100"
                                    color="foreground"
                                >
                                    <Icon className="size-6" />
                                    <p>{item.label}</p>
                                </Link>
                            );
                        })}

                        <AmpCreateTab />

                        <MoreTab />
                    </nav>
                </div>

                <ProfileTab />
            </aside>

            <header className="sticky top-0 flex items-center justify-between gap-2 border-b border-black/10 bg-background px-5 py-4 dark:border-white/5 md:hidden">
                <div className="flex items-center gap-1">
                    <PeerAmp />
                    <p className="text-xl font-semibold">PeerAmp</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        isIconOnly
                        radius="full"
                        variant="light"
                        startContent={
                            <Icons.notification className="size-[22px]" />
                        }
                        className="md:hidden"
                    />

                    <Button
                        size="sm"
                        radius="full"
                        isIconOnly
                        variant="light"
                        startContent={
                            <Icons.messages className="size-[22px]" />
                        }
                        className="md:hidden"
                    />
                </div>
            </header>
            {children}
            <footer className="sticky bottom-0 grid grid-flow-col justify-items-stretch border-t border-black/10 bg-background p-2 px-5 dark:border-white/5 md:hidden">
                {asideMenuConfig.slice(0, 3).map((item, index) => {
                    const Icon = Icons[item.icon];

                    return (
                        <div
                            key={index}
                            className="flex items-center justify-center"
                        >
                            <Link
                                href={item.href}
                                className="p-2"
                                color="foreground"
                            >
                                <Icon className="size-6" />
                            </Link>
                        </div>
                    );
                })}

                <AmpCreateTab />

                <ProfileTab />
            </footer>
        </div>
    );
}

export default Sidebar;
