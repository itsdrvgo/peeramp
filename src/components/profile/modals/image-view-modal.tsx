"use client";

import { Avatar, Modal, ModalBody, ModalContent } from "@nextui-org/react";

interface PageProps {
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    image: string;
}

function ImageViewModal({ onClose, isOpen, onOpenChange, image }: PageProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={onOpenChange}
            placement="center"
            hideCloseButton
            classNames={{
                body: "p-0",
                base: "w-auto",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalBody>
                            <Avatar
                                radius="none"
                                src={image}
                                className="h-40 w-40 md:h-72 md:w-72"
                                showFallback
                            />
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ImageViewModal;
