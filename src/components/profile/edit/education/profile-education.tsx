"use client";

import { Icons } from "@/src/components/icons/icons";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { UserResource } from "@clerk/types";
import { Button, useDisclosure } from "@nextui-org/react";
import ManageEducationModal from "../modals/manage-education-modal";
import EducationItem from "./education-item";

interface PageProps extends DefaultProps {
    user: UserResource;
}

function ProfileEducation({ className, user, ...props }: PageProps) {
    const {
        isOpen: isEducationAddModalOpen,
        onOpenChange: onEducationAddModalOpenChange,
        onClose: onEducationAddModalClose,
        onOpen: onEducationAddModalOpen,
    } = useDisclosure();

    return (
        <>
            <div className={cn("space-y-4", className)} {...props}>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold">Education</p>

                    <div>
                        <Button
                            size="sm"
                            startContent={<Icons.add className="size-4" />}
                            color="primary"
                            variant="flat"
                            onPress={onEducationAddModalOpen}
                        >
                            Add Education
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border border-black/20 bg-default-50 dark:border-white/20">
                    {user.publicMetadata.education.length > 0 ? (
                        <div>
                            {user.publicMetadata.education
                                .sort(
                                    (a, b) =>
                                        new Date(
                                            b.startTimestamp.year,
                                            b.startTimestamp.month - 1
                                        ).getTime() -
                                        new Date(
                                            a.startTimestamp.year,
                                            a.startTimestamp.month - 1
                                        ).getTime()
                                )
                                .map((education, index) => (
                                    <EducationItem
                                        key={education.id}
                                        index={index}
                                        education={education}
                                        user={user}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-4">
                            <p className="text-sm opacity-60 md:text-base">
                                You haven&apos;t added any education yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ManageEducationModal
                isOpen={isEducationAddModalOpen}
                onOpenChange={onEducationAddModalOpenChange}
                onClose={onEducationAddModalClose}
                user={user}
            />
        </>
    );
}

export default ProfileEducation;
