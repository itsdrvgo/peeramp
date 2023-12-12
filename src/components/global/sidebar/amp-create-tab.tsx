"use client";

import { useUser } from "@clerk/nextjs";
import { useDisclosure } from "@nextui-org/react";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";
import ManageAmpModal from "../modals/manage-amp-modal";

function AmpCreateTab() {
    const { user, isLoaded } = useUser();
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    if (!isLoaded)
        return (
            <button
                className="flex cursor-pointer items-center justify-center gap-4 rounded-lg p-2 md:justify-start md:p-4 md:px-3 md:hover:bg-default-100"
                onClick={() =>
                    toast.error("Please wait while we load your account...")
                }
            >
                <Icons.create className="h-6 w-6" />
                <p className="hidden md:block">Create</p>
            </button>
        );
    if (!user)
        return (
            <button
                className="flex cursor-pointer items-center justify-center gap-4 rounded-lg p-2 md:justify-start md:p-4 md:px-3 md:hover:bg-default-100"
                onClick={() =>
                    toast.error("You must be signed in to create an amp!")
                }
            >
                <Icons.create className="h-6 w-6" />
                <p className="hidden md:block">Create</p>
            </button>
        );

    return (
        <>
            <button
                className="flex cursor-pointer items-center justify-center gap-4 rounded-lg md:justify-start md:p-4 md:px-3 md:hover:bg-default-100"
                onClick={onOpen}
            >
                <div className="p-2 md:p-0">
                    <Icons.create className="h-6 w-6" />
                </div>
                <p className="hidden md:block">Create</p>
            </button>

            <ManageAmpModal
                isOpen={isOpen}
                onClose={onClose}
                onOpenChange={onOpenChange}
                userId={user.id}
                image={user.imageUrl}
                firstName={user.firstName!}
                username={user.username!}
            />
        </>
    );
}

export default AmpCreateTab;
