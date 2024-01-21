"use client";

import { cn, getIconForConnection } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, useDisclosure } from "@nextui-org/react";
import { Icons } from "../../../icons/icons";
import ManageSocialModal from "../modals/manage-social-modal";
import SocialEditButton from "./social-edit-button";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileSocials({ className, user, ...props }: PageProps) {
    const {
        isOpen: isAddModalOpen,
        onOpen: onAddModalOpen,
        onOpenChange: onAddModalOpenChange,
        onClose: onAddModalClose,
    } = useDisclosure();

    return (
        <>
            <div className={cn("space-y-4", className)} {...props}>
                <p className="text-xl font-semibold">Connections</p>

                <div className="flex flex-wrap items-center gap-2">
                    {user.publicMetadata.socials.length > 0 &&
                        user.publicMetadata.socials.map((social) => (
                            <SocialEditButton
                                icon={getIconForConnection(social.type)}
                                key={social.id}
                                social={social}
                                user={user}
                            />
                        ))}

                    <Button
                        size="sm"
                        radius="full"
                        className="size-auto gap-2 p-1 px-3 text-sm"
                        startContent={<Icons.add className="size-4" />}
                        onPress={onAddModalOpen}
                    >
                        Add Connection
                    </Button>
                </div>
            </div>

            <ManageSocialModal
                isOpen={isAddModalOpen}
                onOpenChange={onAddModalOpenChange}
                onClose={onAddModalClose}
                user={user}
            />
        </>
    );
}

export default ProfileSocials;
