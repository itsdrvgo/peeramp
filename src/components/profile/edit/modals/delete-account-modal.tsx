"use client";

import { deleteUser } from "@/src/actions/user";
import { handleClientError } from "@/src/lib/utils";
import { UserResource } from "@clerk/types";
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function DeleteAccountModal({
    onClose,
    user,
    isOpen,
    onOpenChange,
}: PageProps) {
    const router = useRouter();

    const { mutate: handleDeleteAccount, isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Deleting account...");
            return { toastId };
        },
        mutationFn: async () => {
            await deleteUser(user.id);
        },
        onSuccess: (_, __, ctx) => {
            toast.success("You will be missed!", { id: ctx?.toastId });
            router.push("/");
        },
        onError: (err, _, ctx) => {
            handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Delete Account</ModalHeader>

                        <ModalBody>
                            <p>
                                Are you sure you want to delete your account?
                                This action is irreversible.
                            </p>
                            <p className="text-sm opacity-60">
                                This will also delete all of your content,
                                interactions and data from the site.
                            </p>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                isDisabled={isPending}
                                onPress={close}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                isLoading={isPending}
                                isDisabled={isPending}
                                onPress={() => handleDeleteAccount()}
                            >
                                Yes, Delete it
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default DeleteAccountModal;
