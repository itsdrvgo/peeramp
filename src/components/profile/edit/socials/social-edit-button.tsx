"use client";

import { getColorForConnection } from "@/src/lib/utils";
import { UserSocial } from "@/src/lib/validation/user";
import { UserResource } from "@clerk/types";
import { Button, ButtonProps, useDisclosure } from "@nextui-org/react";
import { Icons } from "../../../icons/icons";
import ManageSocialModal from "../modals/manage-social-modal";

interface PageProps extends ButtonProps {
    social: UserSocial;
    icon: keyof typeof Icons;
    user: UserResource;
}

function SocialEditButton({ social, icon, key, user, ...props }: PageProps) {
    const Icon = Icons[icon];

    const {
        isOpen: isEditModalOpen,
        onOpen: onEditModalOpen,
        onOpenChange: onEditModalOpenChange,
        onClose: onEditModalClose,
    } = useDisclosure();

    return (
        <>
            <Button
                size="sm"
                radius="full"
                key={key}
                color={getColorForConnection(social.type)}
                variant="flat"
                startContent={<Icon className="size-[10px]" />}
                className="size-auto gap-2 p-1 px-3 text-sm"
                onPress={onEditModalOpen}
                {...props}
            >
                {social.name}
            </Button>

            <ManageSocialModal
                isOpen={isEditModalOpen}
                onOpenChange={onEditModalOpenChange}
                onClose={onEditModalClose}
                user={user}
                connection={social}
            />
        </>
    );
}

export default SocialEditButton;
