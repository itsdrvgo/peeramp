"use client";

import { Icons } from "@/src/components/icons/icons";
import { trpc } from "@/src/lib/trpc/client";
import { cn, handleClientError } from "@/src/lib/utils";
import { Education } from "@/src/lib/validation/user";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import ManageEducationModal from "../modals/manage-education-modal";

interface PageProps extends DefaultProps {
    education: Education;
    user: UserResource;
    index: number;
}

function EducationItem({
    className,
    education,
    user,
    index,
    ...props
}: PageProps) {
    const startMonth = education.startTimestamp.month;
    const startYear = education.startTimestamp.year;

    const endMonth = education.endTimestamp.month;
    const endYear = education.endTimestamp.year;

    const startTime = new Date(startYear, startMonth).toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );

    const endTime = new Date(endYear, endMonth).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const {
        isOpen: isEditModalOpen,
        onOpen: onEditModalOpen,
        onClose: onEditModalClose,
        onOpenChange: onEditModalOpenChange,
    } = useDisclosure();

    const {
        isOpen: isDeleteModalOpen,
        onOpen: onDeleteModalOpen,
        onClose: onDeleteModalClose,
        onOpenChange: onDeleteModalOpenChange,
    } = useDisclosure();

    const { mutate: handleDeleteEducation, isPending } =
        trpc.user.education.deleteEducation.useMutation({
            onMutate: () => {
                const toastId = toast.loading("Deleting education...");
                return { toastId };
            },
            onSuccess: (_, __, ctx) => {
                toast.success("Education deleted successfully", {
                    id: ctx?.toastId,
                });
                user.reload();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });

    return (
        <>
            <div
                key={education.id}
                className={cn(
                    "flex justify-between gap-4 border-black/10 p-4 dark:border-white/10",
                    {
                        "border-b":
                            index !== user.publicMetadata.education.length - 1,
                    },
                    className
                )}
                {...props}
            >
                <div className="space-y-1">
                    <p className="font-semibold text-primary md:text-lg">
                        {education.organization}
                    </p>
                    <div className="space-y-1 text-xs md:text-sm">
                        <p>
                            {startTime} - {endTime}
                        </p>
                        <p>
                            <span>
                                {education.degree
                                    .split("_")
                                    .map(
                                        (word) =>
                                            word[0].toUpperCase() +
                                            word.slice(1)
                                    )
                                    .join(" ")}
                            </span>{" "}
                            <span className="opacity-60">
                                ({education.fieldOfStudy},{" "}
                                {education.grade?.achieved}/
                                {education.grade?.total})
                            </span>
                        </p>
                    </div>
                </div>

                <div>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                size="sm"
                                radius="full"
                                isIconOnly
                                variant="light"
                                startContent={
                                    <Icons.moreVert className="size-4" />
                                }
                            />
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem onPress={onEditModalOpen}>
                                Edit
                            </DropdownItem>
                            <DropdownItem
                                color="danger"
                                onPress={onDeleteModalOpen}
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            <ManageEducationModal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                onOpenChange={onEditModalOpenChange}
                education={education}
                user={user}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                onOpenChange={onDeleteModalOpenChange}
                placement="center"
            >
                <ModalContent>
                    {(close) => (
                        <>
                            <ModalHeader>Delete Education</ModalHeader>

                            <ModalBody>
                                Are you sure you want to delete this education?
                                This is permanent and cannot be undone.
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
                                    isDisabled={isPending}
                                    isLoading={isPending}
                                    onPress={() =>
                                        handleDeleteEducation({
                                            educationId: education.id!,
                                            metadata: user.publicMetadata,
                                            userId: user.id,
                                        })
                                    }
                                >
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default EducationItem;
