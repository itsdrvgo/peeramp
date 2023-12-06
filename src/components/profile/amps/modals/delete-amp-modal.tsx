"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
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
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PageProps {
    user: UserResource;
    amp: Amp;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function DeleteAmpModal({
    amp,
    onClose,
    isOpen,
    onOpenChange,
    user,
}: PageProps) {
    const router = useRouter();

    const { mutate: handleDeleteAmp } = trpc.amp.deleteAmp.useMutation({
        onMutate: () => {
            toast.success("Your amp will be deleted shortly...");
        },
        onSuccess: () => {
            toast.success("Your amp has been deleted");
            router.refresh();
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            placement="center"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Delete Amp</ModalHeader>

                        <ModalBody>
                            Are you sure you want to delete this amp?
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={close}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                onPress={() => {
                                    handleDeleteAmp({
                                        ampId: amp.id,
                                        creatorId: amp.creatorId,
                                        metadata: user.publicMetadata,
                                    });
                                    close();
                                }}
                            >
                                Delete
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default DeleteAmpModal;
