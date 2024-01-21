"use client";

import { Icons } from "@/src/components/icons/icons";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { handleClientError } from "@/src/lib/utils";
import { passwordSchema } from "@/src/lib/validation/auth";
import { isClerkAPIResponseError } from "@clerk/nextjs";
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const passwordChangeSchema = z
    .object({
        currentPassword: passwordSchema.shape.password,
        newPassword: passwordSchema.shape.password,
        confirmNewPassword: passwordSchema.shape.password,
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function ChangePasswordModal({
    onClose,
    user,
    isOpen,
    onOpenChange,
}: PageProps) {
    const [isVisible1, setIsVisible1] = useState(false);
    const [isVisible2, setIsVisible2] = useState(false);

    const form = useForm<PasswordChangeData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    });

    const { mutate: handleChangePassword } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Changing password...");
            return { toastId };
        },
        mutationFn: async (data: PasswordChangeData) => {
            if (!user) throw new Error("User is not logged in!");

            await user.updatePassword({
                newPassword: data.newPassword,
                currentPassword: data.currentPassword,
                signOutOfOtherSessions: true,
            });
        },
        onSuccess: (_, __, ctx) => {
            toast.success("Password changed successfully!", {
                id: ctx?.toastId,
            });
            onClose();
            user.reload();
        },
        onError: (err, __, ctx) => {
            isClerkAPIResponseError(err)
                ? toast.error(
                      err.errors[0].longMessage ?? DEFAULT_ERROR_MESSAGE,
                      { id: ctx?.toastId }
                  )
                : handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={onOpenChange}
            placement="center"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Change Password</ModalHeader>

                        <Form {...form}>
                            <form
                                onSubmit={(...args) =>
                                    form.handleSubmit((data) =>
                                        handleChangePassword(data)
                                    )(...args)
                                }
                            >
                                <ModalBody>
                                    <FormField
                                        control={form.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Current Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        size="sm"
                                                        radius="sm"
                                                        placeholder="********"
                                                        type={
                                                            isVisible1
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        endContent={
                                                            <button
                                                                type="button"
                                                                className="focus:outline-none"
                                                                onClick={() =>
                                                                    setIsVisible1(
                                                                        !isVisible1
                                                                    )
                                                                }
                                                            >
                                                                {isVisible1 ? (
                                                                    <Icons.hide className="size-5 opacity-80" />
                                                                ) : (
                                                                    <Icons.view className="size-5 opacity-80" />
                                                                )}
                                                            </button>
                                                        }
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        size="sm"
                                                        radius="sm"
                                                        placeholder="********"
                                                        type={
                                                            isVisible2
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        endContent={
                                                            <button
                                                                type="button"
                                                                className="focus:outline-none"
                                                                onClick={() =>
                                                                    setIsVisible2(
                                                                        !isVisible2
                                                                    )
                                                                }
                                                            >
                                                                {isVisible2 ? (
                                                                    <Icons.hide className="size-5 opacity-80" />
                                                                ) : (
                                                                    <Icons.view className="size-5 opacity-80" />
                                                                )}
                                                            </button>
                                                        }
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmNewPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        size="sm"
                                                        radius="sm"
                                                        placeholder="********"
                                                        type="password"
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
                                        onPress={close}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        type="submit"
                                    >
                                        Update
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

export default ChangePasswordModal;
