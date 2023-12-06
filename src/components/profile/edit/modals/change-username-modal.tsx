"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { handleClientError } from "@/src/lib/utils";
import { UsernameData, usernameSchema } from "@/src/lib/validation/auth";
import { UserResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function ChangeUsernameModal({
    user,
    onClose,
    isOpen,
    onOpenChange,
}: PageProps) {
    const form = useForm<UsernameData>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: user.username!,
        },
    });

    const { mutate: handleUsernameChange, isLoading: isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Changing username...");
            return { toastId };
        },
        mutationFn: async (data: UsernameData) => {
            if (
                new Date(user.publicMetadata.usernameChangedAt).getTime() +
                    60 * 24 * 60 * 60 >
                Date.now()
            )
                throw new Error(
                    "You can only change your username once every 60 days!"
                );

            await user.update({
                username: data.username,
            });
        },
        onSuccess: (_, __, ctx) => {
            toast.success("Username changed", { id: ctx?.toastId });
            onClose();
            user.reload();
        },
        onError: (err, __, ctx) => {
            handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                onClose();
                form.reset();
            }}
            placement="center"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Change Username</ModalHeader>

                        <Form {...form}>
                            <form
                                onSubmit={(...args) =>
                                    form.handleSubmit((data) =>
                                        handleUsernameChange(data)
                                    )(...args)
                                }
                            >
                                <ModalBody>
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="text"
                                                        size="sm"
                                                        radius="sm"
                                                        placeholder="ryomensukuna"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                                        isDisabled={
                                            !form.formState.isDirty || isPending
                                        }
                                        type="submit"
                                    >
                                        Save
                                    </Button>
                                </ModalFooter>
                            </form>
                        </Form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ChangeUsernameModal;
