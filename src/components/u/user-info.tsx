"use client";

import {
    cn,
    getColorForConnection,
    getIconForConnection,
    getUserCategory,
    shortenNumber,
} from "@/src/lib/utils";
import { CachedUserWithoutEmail } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Link,
    useDisclosure,
} from "@nextui-org/react";
import NextLink from "next/link";
import { Icons } from "../icons/icons";
import ImageViewModal from "../profile/modals/image-view-modal";
import MoreSocialModal from "../profile/modals/more-social-modal";

interface PageProps extends DefaultProps {
    target: CachedUserWithoutEmail;
    ampCount: number;
}

function UserInfo({ target, ampCount, className, ...props }: PageProps) {
    const {
        isOpen: isImageViewModalOpen,
        onOpen: openImageViewModal,
        onOpenChange: onImageViewModalOpenChange,
        onClose: closeImageViewModal,
    } = useDisclosure();

    const {
        isOpen: isMoreModalOpen,
        onOpen: onMoreModalOpen,
        onOpenChange: onMoreModalOpenChange,
        onClose: onMoreModalClose,
    } = useDisclosure();

    return (
        <>
            <div
                className={cn(
                    "flex flex-col items-center justify-between gap-5 md:flex-row",
                    className
                )}
                {...props}
            >
                <button onClick={openImageViewModal}>
                    <Avatar
                        src={target.image}
                        alt={target.username}
                        size="lg"
                        showFallback
                        classNames={{
                            base: "h-32 w-32",
                        }}
                    />
                </button>

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="w-full space-y-2 md:space-y-4">
                        {getAccountName(target)}

                        {getAccountStatsLG({
                            ampCount,
                        })}

                        {getAccountBio(target)}

                        {getAccountStatsSM({
                            ampCount,
                        })}

                        {getAccountSocials({
                            target,
                            onMoreModalOpen,
                        })}

                        <div className="space-y-5 py-1 md:hidden">
                            <Divider />

                            <div className="flex gap-2">
                                <Button
                                    radius="sm"
                                    className="h-auto w-full py-[6px] font-semibold dark:text-black"
                                    color="primary"
                                >
                                    Follow
                                </Button>
                                <Button
                                    radius="sm"
                                    className="h-auto w-full py-[6px]"
                                >
                                    Message
                                </Button>
                                <Button
                                    radius="sm"
                                    className="h-auto w-full py-[6px]"
                                >
                                    More
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImageViewModal
                isOpen={isImageViewModalOpen}
                onClose={closeImageViewModal}
                onOpenChange={onImageViewModalOpenChange}
                image={target.image}
            />

            <MoreSocialModal
                connections={target.socials}
                isOpen={isMoreModalOpen}
                onOpenChange={onMoreModalOpenChange}
                onClose={onMoreModalClose}
                firstName={target.firstName}
            />
        </>
    );
}

export default UserInfo;

function getAccountName(target: CachedUserWithoutEmail) {
    return (
        <div className="flex items-center justify-center md:justify-between">
            <p className="flex flex-col text-center text-xl font-semibold md:text-start">
                <span>{target.username}</span>
                <span className="text-base font-normal md:hidden">
                    {target.firstName} {target.lastName}
                </span>
            </p>

            <div className="hidden items-center gap-2 md:flex">
                <Button
                    radius="sm"
                    className="h-auto py-1 font-semibold dark:text-black"
                    color="primary"
                >
                    Follow
                </Button>
                <Button radius="sm" className="h-auto py-1">
                    Message
                </Button>
                <Button
                    size="sm"
                    isIconOnly
                    radius="full"
                    variant="light"
                    startContent={<Icons.moreHor className="h-4 w-4" />}
                />
            </div>
        </div>
    );
}

function getAccountStatsLG({ ampCount }: { ampCount: number }) {
    return (
        <div className="hidden justify-between gap-2 md:flex">
            <p>
                <span className="mr-1 font-semibold">
                    {shortenNumber(ampCount)}
                </span>
                Amps
            </p>
            <p>
                <span className="mr-1 font-semibold">
                    {shortenNumber(1465146)}
                </span>
                Peers
            </p>
            <p>
                <span className="mr-1 font-semibold">
                    {shortenNumber(1365163)}
                </span>
                Following
            </p>
        </div>
    );
}

function getAccountStatsSM({ ampCount }: { ampCount: number }) {
    return (
        <div className="grid grid-flow-col justify-items-stretch py-4 md:hidden">
            <p className="flex flex-col items-center">
                <span className="font-semibold">{shortenNumber(ampCount)}</span>
                <span className="text-sm opacity-60">Amps</span>
            </p>
            <p className="flex flex-col items-center">
                <span className="font-semibold">{shortenNumber(4561561)}</span>
                <span className="text-sm opacity-60">Peers</span>
            </p>
            <p className="flex flex-col items-center">
                <span className="font-semibold">{shortenNumber(41561)}</span>
                <span className="text-sm opacity-60">Following</span>
            </p>
        </div>
    );
}

function getAccountBio(target: CachedUserWithoutEmail) {
    return (
        <>
            {(target.category !== "none" || target.bio) && (
                <div className="space-y-2">
                    <p className="hidden md:block">
                        {target.firstName} {target.lastName}
                    </p>

                    {target.category !== "none" && (
                        <p className="text-center opacity-80 md:text-start">
                            {getUserCategory(target.category)}
                        </p>
                    )}

                    {target.bio && (
                        <div className="rounded-lg border border-white/20 p-3 px-4 text-sm md:border-0 md:p-0">
                            <p>
                                {target.bio.split("\n").map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        <br />
                                    </span>
                                ))}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

function getAccountSocials({
    target,
    onMoreModalOpen,
}: {
    target: CachedUserWithoutEmail;
    onMoreModalOpen: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            {target.socials.length > 0 && (
                <>
                    {target.socials.slice(0, 3).map((social) => {
                        const Icon = Icons[getIconForConnection(social.type)];

                        return (
                            <Link
                                as={NextLink}
                                key={social.id}
                                href={social.url}
                                isExternal
                            >
                                <Chip
                                    color={getColorForConnection(social.type)}
                                    variant="flat"
                                    className="cursor-pointer"
                                    startContent={
                                        <div className="p-1">
                                            <Icon className="h-[10px] w-[10px]" />
                                        </div>
                                    }
                                >
                                    {social.name}
                                </Chip>
                            </Link>
                        );
                    })}

                    {target.socials.length > 3 && (
                        <Button
                            className="h-auto w-auto min-w-0 items-center gap-0 bg-default-100 px-2 py-[2px]"
                            variant="flat"
                            onPress={() => onMoreModalOpen()}
                        >
                            <p>+ {target.socials.length - 3}</p>
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
