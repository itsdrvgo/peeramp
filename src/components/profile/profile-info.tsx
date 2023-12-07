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
import { UserResource } from "@clerk/types";
import {
    Avatar,
    Button,
    Chip,
    Divider,
    Link,
    useDisclosure,
} from "@nextui-org/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import PfpUploadModal from "../global/modals/pfp-upload";
import { Icons } from "../icons/icons";
import ImageViewModal from "./modals/image-view-modal";
import MoreSocialModal from "./modals/more-social-modal";

interface PageProps extends DefaultProps {
    user: UserResource;
    ampCount: number;
    target?: CachedUserWithoutEmail;
}

function ProfileInfo({
    className,
    user,
    ampCount,
    target,
    ...props
}: PageProps) {
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

    const {
        isOpen: isImageViewModalOpen,
        onOpen: onImageViewModalOpen,
        onOpenChange: onImageViewModalOpenChange,
        onClose: onImageViewModalClose,
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
                <button
                    onClick={target ? onImageViewModalOpen : onImageModalOpen}
                >
                    <Avatar
                        src={target ? target.image : user.imageUrl}
                        alt={target ? target.username : user.username!}
                        size="lg"
                        showFallback
                        classNames={{
                            base: "h-32 w-32",
                        }}
                    />
                </button>

                <div className="flex w-full basis-2/3 flex-col-reverse items-center justify-between gap-8 md:flex-row md:items-start">
                    <div className="w-full space-y-2 md:space-y-4">
                        {target
                            ? getAccountName({ type: "target", data: target })
                            : getAccountName({ type: "user", data: user })}

                        {target
                            ? getAccountStatsLG({
                                  type: "target",
                                  data: target,
                                  ampCount,
                              })
                            : getAccountStatsLG({
                                  type: "user",
                                  data: user,
                                  ampCount,
                              })}

                        {target
                            ? getAccountBio({
                                  type: "target",
                                  data: target,
                              })
                            : getAccountBio({ type: "user", data: user })}

                        {target
                            ? getAccountStatsSM({
                                  type: "target",
                                  data: target,
                                  ampCount,
                              })
                            : getAccountStatsSM({
                                  type: "user",
                                  data: user,
                                  ampCount,
                              })}

                        {target
                            ? getAccountSocials({
                                  type: "target",
                                  data: target,
                                  onMoreModalOpen: onMoreModalOpen,
                              })
                            : getAccountSocials({
                                  type: "user",
                                  data: user,
                                  onMoreModalOpen: onMoreModalOpen,
                              })}

                        {target && (
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
                        )}
                    </div>

                    <div
                        className={cn({
                            hidden: target && target.id !== user.id,
                        })}
                    >
                        <Button
                            size="sm"
                            variant="flat"
                            startContent={<Icons.pencil className="h-4 w-4" />}
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
                connections={
                    target ? target.socials : user.publicMetadata.socials
                }
                isOpen={isMoreModalOpen}
                onOpenChange={onMoreModalOpenChange}
                onClose={onMoreModalClose}
                firstName={target ? target.firstName : user.firstName!}
            />

            <ImageViewModal
                image={target ? target.image : user.imageUrl}
                isOpen={isImageViewModalOpen}
                onOpenChange={onImageViewModalOpenChange}
                onClose={onImageViewModalClose}
            />
        </>
    );
}

export default ProfileInfo;

type UserProps = UserPropsForNativeUser | UserPropsForTargetUser;

type UserPropsForNativeUser = {
    type: "user";
    data: UserResource;
};

type UserPropsForTargetUser = {
    type: "target";
    data: CachedUserWithoutEmail;
};

function getAccountName(opt: UserProps) {
    return (
        <div className="flex items-center justify-center md:justify-between">
            <p className="flex flex-col text-center text-xl font-semibold md:text-start">
                <span>{opt.data.username}</span>
                <span className="text-base font-normal md:hidden">
                    {opt.data.firstName} {opt.data.lastName}
                </span>
            </p>

            <div
                className={cn(
                    "items-center gap-2",
                    opt.type === "user" ? "hidden" : "hidden md:flex"
                )}
            >
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

function getAccountStatsLG(opt: UserProps & { ampCount: number }) {
    return (
        <div className="hidden justify-between gap-2 md:flex">
            <p>
                <span className="mr-1 font-semibold">
                    {shortenNumber(opt.ampCount)}
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

function getAccountStatsSM(opt: UserProps & { ampCount: number }) {
    return (
        <div className="grid grid-flow-col justify-items-stretch py-4 md:hidden">
            <p className="flex flex-col items-center">
                <span className="font-semibold">
                    {shortenNumber(opt.ampCount)}
                </span>
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

function getAccountBio(opt: UserProps) {
    return (
        <>
            {opt.type === "target" ? (
                <>
                    {(opt.data.category !== "none" || opt.data.bio) && (
                        <div className="space-y-2">
                            <p className="hidden md:block">
                                {opt.data.firstName} {opt.data.lastName}
                            </p>

                            {opt.data.category !== "none" && (
                                <p className="text-center opacity-80 md:text-start">
                                    {getUserCategory(opt.data.category)}
                                </p>
                            )}

                            {opt.data.bio && (
                                <div className="rounded-lg border border-white/20 p-3 px-4 text-sm md:border-0 md:p-0">
                                    <p>
                                        {opt.data.bio
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
            ) : (
                <>
                    {(opt.data.publicMetadata.category !== "none" ||
                        opt.data.publicMetadata.bio) && (
                        <div className="space-y-2">
                            <p className="hidden md:block">
                                {opt.data.firstName} {opt.data.lastName}
                            </p>

                            {opt.data.publicMetadata.category !== "none" && (
                                <p className="text-center opacity-80 md:text-start">
                                    {getUserCategory(
                                        opt.data.publicMetadata.category
                                    )}
                                </p>
                            )}

                            {opt.data.publicMetadata.bio && (
                                <div className="rounded-lg border border-white/20 p-3 px-4 text-sm md:border-0 md:p-0">
                                    <p>
                                        {opt.data.publicMetadata.bio
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
            )}
        </>
    );
}

function getAccountSocials(opt: UserProps & { onMoreModalOpen: () => void }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {opt.type === "target" ? (
                <>
                    {opt.data.socials.length > 0 && (
                        <>
                            {opt.data.socials.slice(0, 3).map((social) => {
                                const Icon =
                                    Icons[getIconForConnection(social.type)];

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

                            {opt.data.socials.length > 3 && (
                                <Button
                                    className="h-auto w-auto min-w-0 items-center gap-0 bg-default-100 px-2 py-[2px]"
                                    variant="flat"
                                    onPress={() => opt.onMoreModalOpen()}
                                >
                                    <p>+ {opt.data.socials.length - 3}</p>
                                </Button>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    {opt.data.publicMetadata.socials.length > 0 && (
                        <>
                            {opt.data.publicMetadata.socials
                                .slice(0, 3)
                                .map((social) => {
                                    const Icon =
                                        Icons[
                                            getIconForConnection(social.type)
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

                            {opt.data.publicMetadata.socials.length > 3 && (
                                <Button
                                    className="h-auto w-auto min-w-0 items-center gap-0 bg-default-100 px-2 py-[2px]"
                                    variant="flat"
                                    onPress={() => opt.onMoreModalOpen()}
                                >
                                    <p>
                                        +{" "}
                                        {opt.data.publicMetadata.socials
                                            .length - 3}
                                    </p>
                                </Button>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
