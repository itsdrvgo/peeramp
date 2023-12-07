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

function PublishAmpModal({
    amp,
    onClose,
    isOpen,
    onOpenChange,
    user,
}: PageProps) {
    const router = useRouter();

    const { mutate: handlePublishAmp } = trpc.amp.publishAmp.useMutation({
        onMutate: () => {
            toast.success("Your amp will be published shortly...");
        },
        onSuccess: () => {
            toast.success("Your amp has been published");
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
                        <ModalHeader>Publish Amp</ModalHeader>

                        <ModalBody>
                            Are you sure you want to publish this amp?
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
                                    handlePublishAmp({
                                        ampId: amp.id,
                                        creatorId: user.id,
                                    });
                                    close();
                                }}
                            >
                                Publish
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default PublishAmpModal;
