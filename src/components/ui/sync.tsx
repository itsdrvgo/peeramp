"use client";

import { EmptyPlaceholder } from "@/src/components/ui/empty-placeholder";
import { cFetch, handleClientError, wait } from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { UserResource } from "@clerk/types";
import { Button } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function SyncAccount({ user }: { user: UserResource }) {
    const [isSynced, setIsSynced] = useState(false);

    useEffect(() => {
        updateMissingMetadata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { mutate: updateMissingMetadata } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Updating account...");
            return { toastId };
        },
        mutationFn: async () => {
            await wait(2000);

            const body: UserPublicMetadata = {
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
                bio:
                    "bio" in user.publicMetadata ? user.publicMetadata.bio : "",
                category:
                    "category" in user.publicMetadata
                        ? user.publicMetadata.category
                        : "none",
                socials:
                    "socials" in user.publicMetadata
                        ? user.publicMetadata.socials
                        : [],
                ampCount:
                    "ampCount" in user.publicMetadata
                        ? user.publicMetadata.ampCount
                        : 0,
                followingCount:
                    "followingCount" in user.publicMetadata
                        ? user.publicMetadata.followingCount
                        : 0,
                peersCount:
                    "peersCount" in user.publicMetadata
                        ? user.publicMetadata.peersCount
                        : 0,
            };

            const data = await cFetch<ResponseData>(`/api/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify(body),
            });

            return data;
        },
        onSuccess: (data, __, ctx) => {
            if (data.message !== "OK")
                return toast.error(data.message, {
                    id: ctx?.toastId,
                });

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
