"use client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/form";
import { trpc } from "@/src/lib/trpc/client";
import { handleClientError } from "@/src/lib/utils";
import {
    Education,
    userDegreeSchema,
    userEducationSchema,
    userEducationTypeSchema,
} from "@/src/lib/validation/user";
import { CategoryProps } from "@/src/types";
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
    Textarea,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const educationTypes: CategoryProps[] = userEducationTypeSchema._def.options
    .map((option) => option.value)
    .map((value) => ({
        label: value[0].toUpperCase() + value.slice(1),
        value,
    }));

const degrees: CategoryProps[] = userDegreeSchema._def.options
    .map((option) => option.value)
    .map((value) => ({
        label: value
            .split("_")
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join(" "),
        value,
    }));

const months: CategoryProps[] = [
    {
        label: "January",
        value: "0",
    },
    {
        label: "February",
        value: "1",
    },
    {
        label: "March",
        value: "2",
    },
    {
        label: "April",
        value: "3",
    },
    {
        label: "May",
        value: "4",
    },
    {
        label: "June",
        value: "5",
    },
    {
        label: "July",
        value: "6",
    },
    {
        label: "August",
        value: "7",
    },
    {
        label: "September",
        value: "8",
    },
    {
        label: "October",
        value: "9",
    },
    {
        label: "November",
        value: "10",
    },
    {
        label: "December",
        value: "11",
    },
];

const years: CategoryProps[] = Array.from(
    { length: new Date().getFullYear() - 1900 },
    (_, i) => ({
        label: (new Date().getFullYear() - i).toString(),
        value: (new Date().getFullYear() - i).toString(),
    })
);

interface PageProps {
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    education?: Education;
}

function ManageEducationModal({
    user,
    onClose,
    isOpen,
    onOpenChange,
    education,
}: PageProps) {
    const form = useForm<Education>({
        resolver: zodResolver(userEducationSchema),
        defaultValues: {
            organization: education ? education.organization : "",
            type: education ? education.type : "school",
            degree: education ? education.degree : "none",
            fieldOfStudy: education ? education.fieldOfStudy : "",
            grade: {
                achieved:
                    education && education.grade
                        ? education.grade.achieved
                        : "0",
                total:
                    education && education.grade ? education.grade.total : "0",
            },
            description: education ? education.description : "",
            startTimestamp: {
                month:
                    education && education.startTimestamp
                        ? education.startTimestamp.month
                        : new Date().getMonth(),
                year:
                    education && education.startTimestamp
                        ? education.startTimestamp.year
                        : new Date().getFullYear(),
            },
            endTimestamp: {
                month:
                    education && education.endTimestamp
                        ? education.endTimestamp.month
                        : new Date().getMonth(),
                year:
                    education && education.endTimestamp
                        ? education.endTimestamp.year
                        : new Date().getFullYear(),
            },
        },
    });

    const { mutate: handleAddEducation, isPending: isAdding } =
        trpc.user.education.addEduction.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Adding education...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Education added successfully", {
                    id: ctx?.toastId,
                });
                onClose();
                form.reset();
                user.reload();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    const { mutate: handleEditEducation, isPending: isEditing } =
        trpc.user.education.editEducation.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating education...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Education updated successfully", {
                    id: ctx?.toastId,
                });
                onClose();
                form.reset();
                user.reload();
            },
            onError: (err, _, ctx) => {
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
                        <ModalHeader>
                            {education ? "Edit" : "Add"} Education
                        </ModalHeader>

                        <Form {...form}>
                            <form
                                onSubmit={(...args) =>
                                    form.handleSubmit((data) =>
                                        education
                                            ? handleEditEducation({
                                                  education: {
                                                      ...data,
                                                      id: education.id,
                                                  },
                                                  metadata: user.publicMetadata,
                                                  userId: user.id,
                                              })
                                            : handleAddEducation({
                                                  education: data,
                                                  metadata: user.publicMetadata,
                                                  userId: user.id,
                                              })
                                    )(...args)
                                }
                            >
                                <ModalBody className="gap-7">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="organization"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Organization
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            size="sm"
                                                            placeholder="Enter your organization"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex items-center gap-4">
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>
                                                            Type
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                size="sm"
                                                                placeholder="Select a type"
                                                                selectedKeys={[
                                                                    field.value,
                                                                ]}
                                                                disallowEmptySelection
                                                                aria-label="Select a type"
                                                                items={
                                                                    educationTypes
                                                                }
                                                                {...field}
                                                            >
                                                                {(eType) => (
                                                                    <SelectItem
                                                                        key={
                                                                            eType.value
                                                                        }
                                                                    >
                                                                        {
                                                                            eType.label
                                                                        }
                                                                    </SelectItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="degree"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>
                                                            Degree
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Select
                                                                size="sm"
                                                                placeholder="Select a type"
                                                                selectedKeys={[
                                                                    field.value,
                                                                ]}
                                                                disallowEmptySelection
                                                                aria-label="Select a type"
                                                                items={degrees}
                                                                {...field}
                                                            >
                                                                {(degree) => (
                                                                    <SelectItem
                                                                        key={
                                                                            degree.value
                                                                        }
                                                                    >
                                                                        {
                                                                            degree.label
                                                                        }
                                                                    </SelectItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fieldOfStudy"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>
                                                            Field of Study
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                size="sm"
                                                                placeholder="Enter your field of study"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-end gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="grade.achieved"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Grade
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Achieved"
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const regex =
                                                                            /^[0-9]*\.?[0-9]*$/;

                                                                        if (
                                                                            !regex.test(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                            e
                                                                                .target
                                                                                .value ===
                                                                                "." ||
                                                                            e
                                                                                .target
                                                                                .value
                                                                                .length >
                                                                                4
                                                                        )
                                                                            return;

                                                                        form.setValue(
                                                                            "grade.achieved",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="grade.total"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Scale
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Total"
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        if (
                                                                            isNaN(
                                                                                Number(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            )
                                                                        )
                                                                            return;

                                                                        form.setValue(
                                                                            "grade.total",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            size="sm"
                                                            placeholder="Enter a description"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex flex-col items-center gap-4 md:flex-row">
                                            <div className="flex w-full items-center gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="startTimestamp.month"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                Start Date
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    size="sm"
                                                                    placeholder="Select a month"
                                                                    selectedKeys={[
                                                                        field.value.toString(),
                                                                    ]}
                                                                    disallowEmptySelection
                                                                    aria-label="Select a month"
                                                                    items={
                                                                        months
                                                                    }
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        form.setValue(
                                                                            "startTimestamp.month",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        );
                                                                    }}
                                                                >
                                                                    {(
                                                                        month
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                month.value
                                                                            }
                                                                        >
                                                                            {
                                                                                month.label
                                                                            }
                                                                        </SelectItem>
                                                                    )}
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="startTimestamp.year"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                &nbsp;
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    size="sm"
                                                                    placeholder="Select a year"
                                                                    selectedKeys={[
                                                                        field.value.toString(),
                                                                    ]}
                                                                    disallowEmptySelection
                                                                    aria-label="Select a year"
                                                                    items={
                                                                        years
                                                                    }
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        form.setValue(
                                                                            "startTimestamp.year",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        );
                                                                    }}
                                                                >
                                                                    {(year) => (
                                                                        <SelectItem
                                                                            key={
                                                                                year.value
                                                                            }
                                                                        >
                                                                            {
                                                                                year.label
                                                                            }
                                                                        </SelectItem>
                                                                    )}
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex w-full items-center gap-2">
                                                <FormField
                                                    control={form.control}
                                                    name="endTimestamp.month"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                End Date
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    size="sm"
                                                                    placeholder="Select a month"
                                                                    selectedKeys={[
                                                                        field.value.toString(),
                                                                    ]}
                                                                    disallowEmptySelection
                                                                    aria-label="Select a month"
                                                                    items={
                                                                        months
                                                                    }
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        form.setValue(
                                                                            "endTimestamp.month",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        );
                                                                    }}
                                                                >
                                                                    {(
                                                                        month
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                month.value
                                                                            }
                                                                        >
                                                                            {
                                                                                month.label
                                                                            }
                                                                        </SelectItem>
                                                                    )}
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="endTimestamp.year"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>
                                                                &nbsp;
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    size="sm"
                                                                    placeholder="Select a year"
                                                                    selectedKeys={[
                                                                        field.value.toString(),
                                                                    ]}
                                                                    disallowEmptySelection
                                                                    aria-label="Select a year"
                                                                    items={
                                                                        years
                                                                    }
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        form.setValue(
                                                                            "endTimestamp.year",
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        );
                                                                    }}
                                                                >
                                                                    {(year) => (
                                                                        <SelectItem
                                                                            key={
                                                                                year.value
                                                                            }
                                                                        >
                                                                            {
                                                                                year.label
                                                                            }
                                                                        </SelectItem>
                                                                    )}
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ModalBody>

                                <ModalFooter>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        isDisabled={isAdding || isEditing}
                                        onPress={close}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        type="submit"
                                        isDisabled={isAdding || isEditing}
                                        isLoading={isAdding || isEditing}
                                    >
                                        {education ? "Update" : "Add"}
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

export default ManageEducationModal;
