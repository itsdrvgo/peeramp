"use client";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { trpc } from "@/src/lib/trpc/client";
import { handleClientError } from "@/src/lib/utils";
import {
    UserSocial,
    userSocialSchema,
    userSocialTypesSchema,
} from "@/src/lib/validation/user";
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
    Select,
    SelectItem,
    SelectSection,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface CategoryProps {
    label: string;
    value: string;
}

const socials: CategoryProps[] = userSocialTypesSchema._def.options
    .map((option) => option.value)
    .sort()
    .map((value) => ({
        label: value[0].toUpperCase() + value.slice(1),
        value,
    }));

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    connection?: UserSocial;
}

function ManageSocialModal({
    isOpen,
    onClose,
    onOpenChange,
    user,
    connection,
}: PageProps) {
    const form = useForm<UserSocial>({
        resolver: zodResolver(userSocialSchema),
        defaultValues: {
            name: connection?.name ?? "",
            url: connection?.url ?? "",
            type: connection?.type ?? "other",
        },
    });

    const { mutate: addSocial, isLoading: isAdding } =
        trpc.user.social.addSocial.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Adding connection...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Connection added", {
                    id: ctx?.toastId,
                });
                onClose();
                form.reset();
                user.reload();
            },
            onError: (err, __, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const { mutate: editSocial, isLoading: isEditing } =
        trpc.user.social.editSocial.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating connection...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Connection updated", {
                    id: ctx?.toastId,
                });
                onClose();
                form.reset();
                user.reload();
            },
            onError: (err, __, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const { mutate: handleDeleteSocial, isLoading: isDeleting } =
        trpc.user.social.deleteSocial.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting connection...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Connection deleted", {
                    id: ctx?.toastId,
                });
                onClose();
                form.reset();
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
                        <ModalHeader>
                            {connection ? "Edit" : "Add"} Connection
                        </ModalHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit((data) =>
                                    connection
                                        ? editSocial({
                                              userId: user.id,
                                              metadata: user.publicMetadata,
                                              social: {
                                                  ...data,
                                                  id: connection.id,
                                              },
                                          })
                                        : addSocial({
                                              userId: user.id,
                                              metadata: user.publicMetadata,
                                              social: data,
                                          })
                                )}
                            >
                                <ModalBody className="gap-7">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Profile Name
                                                    </FormLabel>
                                                    <FormDescription>
                                                        This is the name that
                                                        will be displayed on
                                                        your profile.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            size="sm"
                                                            radius="sm"
                                                            placeholder="itsdrvgo"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Profile Link
                                                    </FormLabel>
                                                    <FormDescription>
                                                        The link to your
                                                        connection.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            size="sm"
                                                            radius="sm"
                                                            placeholder="https://x.com/itsdrvgo"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Platform
                                                    </FormLabel>
                                                    <FormDescription>
                                                        The platform of your
                                                        connection.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Select
                                                            size="sm"
                                                            placeholder="Select a platform"
                                                            selectedKeys={[
                                                                field.value,
                                                            ]}
                                                            disallowEmptySelection
                                                            aria-label="Select a platform"
                                                            {...field}
                                                        >
                                                            <SelectSection
                                                                showDivider
                                                                aria-label="Other"
                                                            >
                                                                {socials
                                                                    .filter(
                                                                        (x) =>
                                                                            x.value ===
                                                                            "other"
                                                                    )
                                                                    .map(
                                                                        (
                                                                            social
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    social.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    social.label
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                            </SelectSection>

                                                            <SelectSection aria-label="Socials">
                                                                {socials
                                                                    .filter(
                                                                        (x) =>
                                                                            x.value !==
                                                                            "other"
                                                                    )
                                                                    .map(
                                                                        (
                                                                            social
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    social.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    social.label
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                            </SelectSection>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {connection && (
                                        <div className="space-y-5">
                                            <div className="relative border-b border-white/20">
                                                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-default-50 p-1 px-2 text-sm opacity-80">
                                                    OR
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm opacity-60">
                                                    Remove this connection
                                                </p>

                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    isDisabled={isDeleting}
                                                    isLoading={isDeleting}
                                                    onPress={() =>
                                                        handleDeleteSocial({
                                                            userId: user.id,
                                                            metadata:
                                                                user.publicMetadata,
                                                            socialId:
                                                                connection.id!,
                                                        })
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </ModalBody>

                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={close}
                                        isDisabled={
                                            isAdding || isEditing || isDeleting
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        type="submit"
                                        isDisabled={
                                            !form.formState.isDirty ||
                                            isAdding ||
                                            isEditing ||
                                            isDeleting
                                        }
                                        isLoading={
                                            isAdding || isEditing || isDeleting
                                        }
                                    >
                                        {connection ? "Update" : "Add"}
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

export default ManageSocialModal;
