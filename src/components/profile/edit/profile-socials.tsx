"use client";

import { cn, getIconForConnection } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, useDisclosure } from "@nextui-org/react";
import { Icons } from "../../icons/icons";
import ManageSocialModal from "./modals/manage-social-modal";
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
                        className="h-auto w-auto gap-0 p-0 text-sm"
                        onPress={onAddModalOpen}
                    >
                        <div className="border-r border-white/20 px-3 py-1 pr-2">
                            <p>Add Connection</p>
                        </div>
                        <div className="p-1 px-2">
                            <Icons.add className="h-4 w-4" />
                        </div>
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
