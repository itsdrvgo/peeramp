"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import { Button, Skeleton } from "@nextui-org/react";
import { redirect } from "next/navigation";
import { Icons } from "../../icons/icons";
import ProfileEdit from "./profile-edit";

function ProfileEditFetch({ className, ...props }: DefaultProps) {
    const { user, isLoaded } = useUser();
    if (!isLoaded) return <ProfileEditSkeleton />;
    if (!user) redirect("/signin");

    return <ProfileEdit user={user} className={className} {...props} />;
}

export default ProfileEditFetch;

function ProfileEditSkeleton({ className, ...props }: DefaultProps) {
    return (
        <div
            className={cn("w-full max-w-2xl space-y-5 px-5 py-10", className)}
            {...props}
        >
            <div>
                <p className="text-2xl font-bold">Edit Profile</p>
                <p className="opacity-80">Edit your profile information</p>
            </div>

            <div className="flex items-center gap-5">
                <Skeleton className="h-14 w-14 rounded-full" />

                <div className="space-y-1">
                    <Skeleton className="h-5 w-24 rounded-lg" />
                    <p className="cursor-default text-sm font-semibold text-primary-500">
                        Change Profile Picture
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between gap-4">
                    <div className="w-full space-y-2">
                        <p className="text-sm font-semibold">First Name</p>
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>

                    <div className="w-full space-y-2">
                        <p className="text-sm font-semibold">Last Name</p>
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                </div>

                <div className="w-full space-y-2">
                    <p className="text-sm font-semibold">Bio</p>
                    <Skeleton className="h-28 w-full rounded-lg" />
                </div>

                <div className="w-full space-y-2">
                    <p className="text-sm font-semibold">Category</p>
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>

                <div className="w-full space-y-2">
                    <p className="text-sm font-semibold">Gender</p>
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-xl font-semibold">Resume</p>

                <Skeleton className="h-60 w-full rounded-lg" />
            </div>

            <div className="space-y-4">
                <p className="text-xl font-semibold">Connections</p>

                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-7 w-32 rounded-xl" />
                    <Skeleton className="h-7 w-20 rounded-xl" />
                    <Skeleton className="h-7 w-28 rounded-xl" />
                    <Skeleton className="h-7 w-32 rounded-xl" />

                    <Button
                        className="h-auto w-auto gap-0 p-0 text-sm"
                        isDisabled={true}
                    >
                        <div className="border-r border-white/20 px-3 py-1 pr-2">
                            <p>Add Connection</p>
                        </div>
                        <div className="p-1 px-2">
                            <Icons.add className="h-4 w-4" />
                        </div>
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-xl font-semibold">Danger Zone</p>

                <div className="rounded-lg border border-danger-100 bg-default-50">
                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your username</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your username and your profile
                                link. You can only do this once every 60 days.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            isDisabled={true}
                        >
                            Change Username
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your Email</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your email and you will have to
                                verify it again.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            isDisabled={true}
                        >
                            Change Email
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-b border-black/40 p-4 dark:border-white/20">
                        <div className="space-y-1">
                            <p>Change your password</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will change your password. You will have to
                                log in using your new password next time.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            isDisabled={true}
                        >
                            Change Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-4">
                        <div className="space-y-1">
                            <p>Delete your account</p>
                            <p className="max-w-sm text-sm opacity-60">
                                This will delete your account. You will not be
                                able to recover your account after deletion.
                            </p>
                        </div>

                        <Button
                            color="danger"
                            size="sm"
                            variant="faded"
                            className="text-danger-400"
                            isDisabled={true}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
