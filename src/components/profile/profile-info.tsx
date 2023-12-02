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
import { useState } from "react";
import PfpUploadModal from "../global/modals/pfp-upload";
import { Icons } from "../icons/icons";
import MoreSocialModal from "./edit/modals/more-social-modal";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileInfo({ className, user, ...props }: PageProps) {
    const router = useRouter();

    const [iconURL, setIconURL] = useState(user.imageUrl);

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
            <div className={cn("w-full max-w-2xl py-10", className)} {...props}>
                <div className="flex items-center justify-between gap-5">
                    <button onClick={onImageModalOpen}>
                        <Avatar
                            src={iconURL}
                            alt={user.username!}
                            size="lg"
                            classNames={{
                                base: "h-32 w-32",
                            }}
                        />
                    </button>

                    <div className="flex w-full basis-2/3 justify-between gap-4">
                        <div className="w-full space-y-4">
                            <div>
                                <p className="text-xl font-semibold">
                                    {user.firstName} {user.lastName}{" "}
                                    <span className="font-normal opacity-80">
                                        ({user.username})
                                    </span>
                                </p>
                            </div>

                            <div className="flex max-w-xs justify-between gap-2">
                                <p>
                                    <span className="mr-2 font-semibold">
                                        {shortenNumber(785)}
                                    </span>
                                    Amps
                                </p>
                                <p>
                                    <span className="mr-2 font-semibold">
                                        {shortenNumber(4146113)}
                                    </span>
                                    Peers
                                </p>
                                <p>
                                    <span className="mr-2 font-semibold">
                                        {shortenNumber(60)}
                                    </span>
                                    Following
                                </p>
                            </div>

                            {(user.publicMetadata.category !== "none" ||
                                user.publicMetadata.bio) && (
                                <div className="space-y-2">
                                    {user.publicMetadata.category !==
                                        "none" && (
                                        <p className="opacity-80">
                                            {getUserCategory(
                                                user.publicMetadata.category
                                            )}
                                        </p>
                                    )}

                                    {user.publicMetadata.bio && (
                                        <div className="text-sm">
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

                            <div className="flex flex-wrap items-center gap-2">
                                {user.publicMetadata?.socials.length > 0 && (
                                    <>
                                        {user.publicMetadata.socials
                                            .slice(0, 3)
                                            .map((social) => {
                                                const Icon =
                                                    Icons[
                                                        getIconForConnection(
                                                            social.type
                                                        )
                                                    ];

                                                return (
                                                    <Link
                                                        as={NextLink}
                                                        key={social.id}
                                                        href={social.url}
                                                        isExternal
                                                    >
                                                        <Chip
                                                            color={getColorForConnection(
                                                                social.type
                                                            )}
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

                                        {user.publicMetadata.socials.length >
                                            3 && (
                                            <Button
                                                className="h-auto w-auto min-w-0 items-center gap-0 bg-default-100 px-2 py-[2px]"
                                                variant="flat"
                                                onPress={onMoreModalOpen}
                                            >
                                                <p>
                                                    +{" "}
                                                    {user.publicMetadata.socials
                                                        .length - 3}
                                                </p>
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <Button
                                isIconOnly
                                size="sm"
                                variant="shadow"
                                startContent={
                                    <Icons.pencil className="h-4 w-4" />
                                }
                                onPress={() => router.push("/profile/edit")}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <PfpUploadModal
                user={user}
                isOpen={isImageModalOpen}
                onOpenChange={onImageModalOpenChange}
                setIconURL={setIconURL}
                onClose={onImageModalClose}
                iconURL={iconURL}
            />

            <MoreSocialModal
                connections={user.publicMetadata?.socials}
                isOpen={isMoreModalOpen}
                onOpenChange={onMoreModalOpenChange}
                onClose={onMoreModalClose}
                user={user}
            />
        </>
    );
}

export default ProfileInfo;
