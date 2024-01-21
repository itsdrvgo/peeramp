"use client";

import {
    cn,
    getColorForConnection,
    getIconForConnection,
    getUserCategory,
    shortenNumber,
} from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Avatar, Button, Chip, Link, useDisclosure } from "@nextui-org/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import PfpUploadModal from "../global/modals/pfp-upload";
import { Icons } from "../icons/icons";
import MoreSocialModal from "./modals/more-social-modal";

interface PageProps extends DefaultProps {
    user: UserResource;
    ampCount: number;
}

function ProfileInfo({ className, user, ampCount, ...props }: PageProps) {
    const router = useRouter();

    const {
        isOpen: isImageModalOpen,
        onOpen: onImageModalOpen,
        onOpenChange: onImageModalOpenChange,
        onClose: onImageModalClose,
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
                <button onClick={onImageModalOpen}>
                    <Avatar
                        src={user.imageUrl}
                        alt={user.username!}
                        size="lg"
                        showFallback
                        classNames={{
                            base: "h-32 w-32",
                        }}
                    />
                </button>

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="w-full space-y-2 md:space-y-4">
                        {getAccountName(user)}

                        {getAccountStatsLG({
                            ampCount,
                        })}

                        {getAccountBio(user)}

                        {getAccountStatsSM({
                            ampCount,
                        })}

                        {getAccountSocials({
                            user,
                            onMoreModalOpen,
                        })}
                    </div>

                    <div>
                        <Button
                            size="sm"
                            variant="flat"
                            startContent={<Icons.pencil className="size-4" />}
                            className="min-w-0 md:px-2"
                            onPress={() => router.push("/profile/edit")}
                        >
                            <p className="md:hidden">Edit Profile</p>
                        </Button>
                    </div>
                </div>
            </div>

            <PfpUploadModal
                user={user}
                isOpen={isImageModalOpen}
                onOpenChange={onImageModalOpenChange}
                onClose={onImageModalClose}
            />

            <MoreSocialModal
                connections={user.publicMetadata.socials}
                isOpen={isMoreModalOpen}
                onOpenChange={onMoreModalOpenChange}
                onClose={onMoreModalClose}
                firstName={user.firstName!}
            />
        </>
    );
}

export default ProfileInfo;

function getAccountName(user: UserResource) {
    return (
        <p className="flex flex-col text-center text-xl font-semibold md:text-start">
            <span>{user.username}</span>
            <span className="text-base font-normal md:hidden">
                {user.firstName} {user.lastName}
            </span>
        </p>
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

function getAccountBio(user: UserResource) {
    return (
        <>
            {(user.publicMetadata.category !== "none" ||
                user.publicMetadata.bio) && (
                <div className="space-y-2">
                    <p className="hidden md:block">
                        {user.firstName} {user.lastName}
                    </p>

                    {user.publicMetadata.category !== "none" && (
                        <p className="text-center opacity-80 md:text-start">
                            {getUserCategory(user.publicMetadata.category)}
                        </p>
                    )}

                    {user.publicMetadata.bio && (
                        <div className="rounded-lg border border-white/20 p-3 px-4 text-sm md:border-0 md:p-0">
                            <p>
                                {user.publicMetadata.bio
                                    .split("\n")
                                    .map((line, index) => (
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
    user,
    onMoreModalOpen,
}: {
    user: UserResource;
    onMoreModalOpen: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1">
            {user.publicMetadata.socials.length > 0 && (
                <>
                    {user.publicMetadata.socials.slice(0, 3).map((social) => {
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
                                            <Icon className="size-[10px]" />
                                        </div>
                                    }
                                >
                                    {social.name}
                                </Chip>
                            </Link>
                        );
                    })}

                    {user.publicMetadata.socials.length > 3 && (
                        <Button
                            size="sm"
                            radius="full"
                            className="h-7 min-h-0 min-w-0 items-center gap-0 bg-default-100 p-2"
                            variant="flat"
                            onPress={() => onMoreModalOpen()}
                        >
                            + {user.publicMetadata.socials.length - 3}
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
