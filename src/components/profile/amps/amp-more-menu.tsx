"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import { cn, handleClientError } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ManageAmpModal from "../../global/modals/amps/manage-amp-modal";
import { Icons } from "../../icons/icons";
import DeleteAmpModal from "./modals/delete-amp-modal";
import PublishAmpModal from "./modals/publish-amp-modal";

interface PageProps extends DefaultProps {
    amp: Amp;
    user: UserResource;
}

function AmpMoreMenu({ amp, user, className, ...props }: PageProps) {
    const router = useRouter();

    const {
        isOpen: isEditModalOpen,
        onOpen: onEditModalOpen,
        onClose: onEditModalClose,
        onOpenChange: onEditModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isPublishModalOpen,
        onOpen: onPublishModalOpen,
        onClose: onPublishModalClose,
        onOpenChange: onPublishModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isDeleteModalOpen,
        onOpen: onDeleteModalOpen,
        onClose: onDeleteModalClose,
        onOpenChange: onDeleteModalOpenChange,
    } = useDisclosure();

    const { mutate: handlePinAmp } = trpc.amp.pinAmp.useMutation({
        onMutate: () => {
            toast.success("Amp will be pinned shortly");
        },
        onSuccess: () => {
            toast.success("Amp has been pinned");
            router.refresh();
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    const { mutate: handleUnpinAmp } = trpc.amp.unpinAmp.useMutation({
        onMutate: () => {
            toast.success("Amp will be unpinned shortly");
        },
        onSuccess: () => {
            toast.success("Amp has been unpinned");
            router.refresh();
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    return (
        <>
            <div className={cn("", className)} {...props}>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            radius="full"
                            variant="light"
                            size="sm"
                            startContent={<Icons.moreHor className="size-4" />}
                        />
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownSection showDivider aria-label="General">
                            <DropdownItem
                                startContent={
                                    <Icons.copy className="size-4" />
                                }
                                onPress={() => {
                                    navigator.clipboard.writeText(
                                        `${window.location.origin}/amps?uId=${amp.creatorId}&aId=${amp.id}`
                                    );
                                    toast.success("Link copied to clipboard");
                                }}
                                className={cn({
                                    hidden: amp.status === "draft",
                                })}
                            >
                                Copy Link
                            </DropdownItem>
                            <DropdownItem
                                startContent={<Icons.pin className="size-4" />}
                                onPress={() => {
                                    amp.pinned
                                        ? handleUnpinAmp({
                                              ampId: amp.id,
                                              creatorId: amp.creatorId,
                                          })
                                        : handlePinAmp({
                                              ampId: amp.id,
                                              creatorId: amp.creatorId,
                                          });
                                }}
                                className={cn({
                                    hidden: amp.status === "draft",
                                })}
                            >
                                {amp.pinned
                                    ? "Unpin from profile"
                                    : "Pin to profile"}
                            </DropdownItem>
                            <DropdownItem
                                startContent={
                                    <Icons.upload className="size-4" />
                                }
                                onPress={onPublishModalOpen}
                                className={cn({
                                    hidden: amp.status === "published",
                                })}
                            >
                                Publish
                            </DropdownItem>
                            <DropdownItem
                                startContent={
                                    <Icons.pencil className="size-4" />
                                }
                                onPress={onEditModalOpen}
                            >
                                Edit
                            </DropdownItem>
                        </DropdownSection>

                        <DropdownSection aria-label="Dangerous">
                            <DropdownItem
                                color="danger"
                                startContent={
                                    <Icons.trash className="size-4" />
                                }
                                onPress={() => onDeleteModalOpen()}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <ManageAmpModal
                amp={amp}
                firstName={user.firstName!}
                image={user.imageUrl}
                userId={user.id}
                username={user.username!}
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                onOpenChange={onEditModalOpenChange}
            />

            <PublishAmpModal
                amp={amp}
                user={user}
                isOpen={isPublishModalOpen}
                onClose={onPublishModalClose}
                onOpenChange={onPublishModalOpenChange}
            />

            <DeleteAmpModal
                amp={amp}
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onOpenChange={onDeleteModalOpenChange}
            />
        </>
    );
}

export default AmpMoreMenu;
