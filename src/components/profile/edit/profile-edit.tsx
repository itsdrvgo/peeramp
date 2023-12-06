"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Avatar, useDisclosure } from "@nextui-org/react";
import ProfileUpdateForm from "../../forms/profile-update-form";
import PfpUploadModal from "../../global/modals/pfp-upload";
import ProfileDangerZone from "./profile-danger-zone";
import ProfileSocials from "./profile-socials";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileEdit({ className, user, ...props }: PageProps) {
    const {
        isOpen: isImageModalOpen,
        onOpen: onImageModalOpen,
        onOpenChange: onImageModalOpenChange,
        onClose: onImageModalClose,
    } = useDisclosure();

    return (
        <>
            <div
                className={cn("w-full max-w-2xl space-y-5 py-10", className)}
                {...props}
            >
                <div>
                    <p className="text-2xl font-bold">Edit Profile</p>
                    <p className="opacity-80">Edit your profile information</p>
                </div>

                <div className="flex items-center gap-5">
                    <Avatar
                        src={user.imageUrl}
                        alt={user.username!}
                        size="lg"
                        className="cursor-pointer"
                        onClick={onImageModalOpen}
                    />

                    <div>
                        <p>{user.username}</p>
                        <button
                            className="text-sm font-semibold text-primary-500"
                            onClick={onImageModalOpen}
                        >
                            Change Profile Picture
                        </button>
                    </div>
                </div>

                <ProfileUpdateForm user={user} />

                <ProfileSocials user={user} />

                <ProfileDangerZone user={user} />
            </div>

            <PfpUploadModal
                user={user}
                isOpen={isImageModalOpen}
                onOpenChange={onImageModalOpenChange}
                onClose={onImageModalClose}
            />
        </>
    );
}

export default ProfileEdit;
