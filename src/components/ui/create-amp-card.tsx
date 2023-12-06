"use client";

import { Avatar, Button, Divider, useDisclosure } from "@nextui-org/react";
import CreatePostModal from "../feed/modals/create-post-modal";
import { Icons } from "../icons/icons";

interface CardProps {
    userId: string;
    image: string;
    username: string;
    firstName: string;
    metadata: UserPublicMetadata;
}

function CreateAmpCard({
    image,
    username,
    firstName,
    userId,
    metadata,
}: CardProps) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    return (
        <>
            <div className="flex w-full flex-col gap-4 rounded-xl bg-default-50 p-3 py-5 md:p-5">
                <div className="flex items-center gap-4">
                    <div>
                        <Avatar src={image} alt={username} />
                    </div>

                    <Button
                        radius="full"
                        variant="flat"
                        className="w-full justify-start"
                        onPress={onOpen}
                    >
                        <p className="opacity-60">
                            What are you thinking, {firstName}?
                        </p>
                    </Button>
                </div>

                <Divider />

                <div className="flex items-center gap-3 text-primary">
                    <Icons.media className="h-5 w-5" />
                    <Icons.smile className="h-5 w-5" />
                </div>
            </div>

            <CreatePostModal
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
                userId={userId}
                image={image}
                username={username}
                firstName={firstName}
                metadata={metadata}
            />
        </>
    );
}

export default CreateAmpCard;
