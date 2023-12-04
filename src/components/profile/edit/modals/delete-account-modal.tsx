"use client";

import { deleteUser } from "@/src/actions/user";
import { Icons } from "@/src/components/icons/icons";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { handleClientError } from "@/src/lib/utils";
import { PasswordData, passwordSchema } from "@/src/lib/validation/auth";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function DeleteAccountModal({
    onClose,
    user,
    isOpen,
    onOpenChange,
}: PageProps) {
    const router = useRouter();

    const [isVisible, setIsVisible] = useState(false);

    const form = useForm<PasswordData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
        },
    });

    const { mutate: handleDeleteAccount, isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Deleting account...");
            return { toastId };
        },
        mutationFn: async (data: PasswordData) => {
            await deleteUser({
                password: data.password,
                userId: user.id,
            });
        },
        onSuccess: (_, __, ctx) => {
            onClose();
            form.reset();
            toast.success("You will be missed!", { id: ctx?.toastId });
            router.push("/");
        },
        onError: (err, _, ctx) => {
            if (err.message === "Unprocessable Entity")
                return toast.error("Incorrect password", { id: ctx?.toastId });
            handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                form.reset();
            }}
            onOpenChange={onOpenChange}
            placement="center"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Delete Account</ModalHeader>
                        <Form {...form}>
                            <form
                                onSubmit={(...args) =>
                                    form.handleSubmit((data) =>
                                        handleDeleteAccount(data)
                                    )(...args)
                                }
                            >
                                <ModalBody>
                                    <p>
                                        Are you sure you want to delete your
                                        account? This action is irreversible.
                                    </p>
                                    <p className="text-sm opacity-60">
                                        This will also delete all of your
                                        content, interactions and data from the
                                        site.
                                    </p>

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Enter your password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        size="sm"
                                                        radius="sm"
                                                        placeholder="********"
                                                        type={
                                                            isVisible
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        endContent={
                                                            <button
                                                                type="button"
                                                                className="focus:outline-none"
                                                                onClick={() =>
                                                                    setIsVisible(
                                                                        !isVisible
                                                                    )
                                                                }
                                                            >
                                                                {isVisible ? (
                                                                    <Icons.hide className="h-5 w-5 opacity-80" />
                                                                ) : (
                                                                    <Icons.view className="h-5 w-5 opacity-80" />
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
                                        type="submit"
                                        color="primary"
                                        variant="flat"
                                        isLoading={isPending}
                                        isDisabled={isPending}
                                    >
                                        Yes, Delete it
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

export default DeleteAccountModal;
