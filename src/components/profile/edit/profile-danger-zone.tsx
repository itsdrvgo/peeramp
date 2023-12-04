"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, useDisclosure } from "@nextui-org/react";
import toast from "react-hot-toast";
import ChangePasswordModal from "./modals/change-password-modal";
import ChangeUsernameModal from "./modals/change-username-modal";
import DeleteAccountModal from "./modals/delete-account-modal";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileDangerZone({ className, user, ...props }: PageProps) {
    const {
        isOpen: isChangeUsernameModalOpen,
        onOpen: onChangeUsernameModalOpen,
        onOpenChange: onChangeUsernameModalOpenChange,
        onClose: onChangeUsernameModalClose,
    } = useDisclosure();

    const {
        isOpen: isDeleteAccountModalOpen,
        onOpen: onDeleteAccountModalOpen,
        onOpenChange: onDeleteAccountModalOpenChange,
        onClose: onDeleteAccountModalClose,
    } = useDisclosure();

    const {
        isOpen: isChangePasswordModalOpen,
        onOpen: onChangePasswordModalOpen,
        onOpenChange: onChangePasswordModalOpenChange,
        onClose: onChangePasswordModalClose,
    } = useDisclosure();

    return (
        <>
            <div className={cn("space-y-4", className)} {...props}>
                <p className="text-xl font-semibold">Danger Zone</p>

                <div className="rounded-lg border border-danger-100 bg-default-50">
                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your username</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your username and your profile
                                link. You can only do this once every 60 days.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            onPress={onChangeUsernameModalOpen}
                        >
                            Change Username
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your Email</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your email and you will have to
                                verify it again.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            onPress={() => toast.error("Coming soon!")}
                        >
                            Change Email
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your password</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your password. You will have to
                                log in using your new password next time.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            onPress={onChangePasswordModalOpen}
                        >
                            Change Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-4">
                        <div className="space-y-1">
                            <p>Delete your account</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will delete your account and all your data.
                                You will not be able to recover your account.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            onPress={onDeleteAccountModalOpen}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                user={user}
                isOpen={isChangePasswordModalOpen}
                onOpenChange={onChangePasswordModalOpenChange}
                onClose={onChangePasswordModalClose}
            />

            <ChangeUsernameModal
                user={user}
                isOpen={isChangeUsernameModalOpen}
                onOpenChange={onChangeUsernameModalOpenChange}
                onClose={onChangeUsernameModalClose}
            />

            <DeleteAccountModal
                user={user}
                isOpen={isDeleteAccountModalOpen}
                onOpenChange={onDeleteAccountModalOpenChange}
                onClose={onDeleteAccountModalClose}
            />
        </>
    );
}

export default ProfileDangerZone;
