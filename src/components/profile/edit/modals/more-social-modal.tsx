"use client";

import { Icons } from "@/src/components/icons/icons";
import { getIconForConnection } from "@/src/lib/utils";
import { UserSocial } from "@/src/lib/validation/user";
import { UserResource } from "@clerk/types";
import {
    Button,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";

interface PageProps {
    connections: UserSocial[];
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserResource;
}

function MoreSocialModal({
    connections,
    onClose,
    isOpen,
    onOpenChange,
    user,
}: PageProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} onOpenChange={onOpenChange}>
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>
                            {user.firstName}&apos;s Connections
                        </ModalHeader>

                        <ModalBody>
                            <div className="space-y-5">
                                {connections.map((connection) => {
                                    const Icon =
                                        Icons[
                                            getIconForConnection(
                                                connection.type
                                            )
                                        ];

                                    return (
                                        <div
                                            key={connection.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="rounded-full bg-secondary-200 p-2 text-white">
                                                    <Icon className="h-4 w-4" />
                                                </div>

                                                <div>
                                                    <p>{connection.name}</p>
                                                    <p className="text-sm opacity-60">
                                                        {connection.type
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            connection.type.slice(
                                                                1
                                                            )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <Button
                                                    href={connection.url}
                                                    size="sm"
                                                    as={Link}
                                                    isExternal
                                                    showAnchorIcon
                                                >
                                                    Visit
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ModalBody>

                        <ModalFooter className="justify-center">
                            <Button
                                size="sm"
                                onPress={close}
                                className="font-semibold"
                            >
                                Done
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default MoreSocialModal;
