"use client";

import { EmptyPlaceholder } from "@/src/components/ui/empty-placeholder";
import { trpc } from "@/src/lib/trpc/client";
import { handleClientError } from "@/src/lib/utils";
import { UserResource } from "@clerk/types";
import { Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function SyncAccount({ user }: { user: UserResource }) {
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        const metadata: UserPublicMetadata = {
            gender:
                "gender" in user.publicMetadata
                    ? user.publicMetadata.gender
                    : "none",
            type:
                "type" in user.publicMetadata
                    ? user.publicMetadata.type
                    : "normal",
            usernameChangedAt:
                "usernameChangedAt" in user.publicMetadata
                    ? user.publicMetadata.usernameChangedAt
                    : user.createdAt?.getTime() || Date.now(),
            bio: "bio" in user.publicMetadata ? user.publicMetadata.bio : null,
            category:
                "category" in user.publicMetadata
                    ? user.publicMetadata.category
                    : "none",
            socials:
                "socials" in user.publicMetadata
                    ? user.publicMetadata.socials
                    : [],
            isVerified:
                "isVerified" in user.publicMetadata
                    ? user.publicMetadata.isVerified
                    : false,
            resume:
                "resume" in user.publicMetadata
                    ? user.publicMetadata.resume
                    : {
                          key: "",
                          name: "",
                          size: 0,
                          url: "",
                      },
            education:
                "education" in user.publicMetadata
                    ? user.publicMetadata.education
                    : [],
        };

        updateMissingMetadata({
            userId: user.id,
            metadata,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { mutate: updateMissingMetadata } =
        trpc.user.updateUserMetadata.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating account...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Account updated!", {
                    id: ctx?.toastId,
                });
                setIsSynced(true);
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <div className="flex h-screen w-full items-center justify-center p-5">
            <EmptyPlaceholder
                title={isSynced ? "Account synced!" : "Syncing account..."}
                description={
                    isSynced
                        ? "Your account has been synced, click the button below to continue."
                        : "Your account is being synced. Please do not close this page."
                }
                icon="refresh"
                className="max-w-md"
                classNames={{
                    header: !isSynced && "animate-spin",
                }}
                endContent={
                    <Button
                        color="secondary"
                        isDisabled={!isSynced}
                        onPress={() => {
                            // reload the window
                            window.location.reload();
                        }}
                    >
                        Continue
                    </Button>
                }
            />
        </div>
    );
}

export default SyncAccount;
