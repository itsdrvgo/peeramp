"use client";

import { trpc } from "@/src/lib/trpc/client";
import { cn, getUserCategory, handleClientError } from "@/src/lib/utils";
import {
    userCategoriesSchema,
    UserEditData,
    userEditSchema,
} from "@/src/lib/validation/user";
import { CategoryProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    Input,
    Select,
    SelectItem,
    SelectSection,
    Textarea,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";

const categories: CategoryProps[] = userCategoriesSchema._def.options
    .map((option) => option.value)
    .sort()
    .map((value) => ({
        label: getUserCategory(value),
        value,
    }));

interface PageProps {
    user: UserResource;
}

function ProfileUpdateForm({ user }: PageProps) {
    const form = useForm<UserEditData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            firstName: user.firstName!,
            lastName: user.lastName!,
            bio: user.publicMetadata.bio ?? "",
            category: user.publicMetadata.category,
            gender: user.publicMetadata.gender,
        },
    });

    const { mutate: handleUserUpdate, isPending } =
        trpc.user.updateUser.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Profile updated", {
                    id: ctx?.toastId,
                });
                user.reload();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <Form {...form}>
            <form
                className="grid gap-4"
                onSubmit={(...args) =>
                    form.handleSubmit((data) =>
                        handleUserUpdate({
                            userId: user.id,
                            metadata: user.publicMetadata,
                            ...data,
                        })
                    )(...args)
                }
            >
                <div className="flex justify-between gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>First Name</FormLabel>
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

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Last Name</FormLabel>
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
                </div>

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <>
                                    <Textarea
                                        maxLength={150}
                                        size="sm"
                                        radius="sm"
                                        classNames={{
                                            inputWrapper: "pb-8",
                                        }}
                                        placeholder="I'm a cool person"
                                        {...field}
                                    />
                                    <span className="absolute bottom-2 right-2 text-sm opacity-80">
                                        {150 - (form.watch("bio")?.length ?? 0)}
                                    </span>
                                </>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Select
                                    size="sm"
                                    placeholder="Select a category"
                                    selectedKeys={[field.value]}
                                    disallowEmptySelection
                                    aria-label="Select a category"
                                    {...field}
                                >
                                    <SelectSection
                                        showDivider
                                        aria-label="None"
                                    >
                                        {categories
                                            .filter((x) => x.value === "none")
                                            .map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                    </SelectSection>

                                    <SelectSection aria-label="Categories">
                                        {categories
                                            .filter((x) => x.value !== "none")
                                            .map((category) => (
                                                <SelectItem
                                                    key={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                    </SelectSection>
                                </Select>
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <Select
                                    size="sm"
                                    placeholder="Select your gender"
                                    selectedKeys={[field.value]}
                                    disallowEmptySelection
                                    aria-label="Select your gender"
                                    {...field}
                                >
                                    <SelectSection
                                        showDivider
                                        aria-label="None"
                                    >
                                        <SelectItem key="none">
                                            Prefer not to say
                                        </SelectItem>
                                    </SelectSection>

                                    <SelectSection aria-label="Genders">
                                        <SelectItem key="male">Male</SelectItem>
                                        <SelectItem key="female">
                                            Female
                                        </SelectItem>
                                        <SelectItem key="other">
                                            Other
                                        </SelectItem>
                                    </SelectSection>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div
                    className={cn("flex items-center justify-end gap-2", {
                        hidden: !form.formState.isDirty,
                    })}
                >
                    <Button
                        className="font-semibold"
                        color="danger"
                        variant="light"
                        type="button"
                        size="sm"
                        onPress={() => form.reset()}
                        isDisabled={!form.formState.isDirty || isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="font-semibold"
                        color="primary"
                        variant="flat"
                        type="submit"
                        size="sm"
                        isDisabled={!form.formState.isDirty || isPending}
                        isLoading={isPending}
                    >
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default ProfileUpdateForm;
