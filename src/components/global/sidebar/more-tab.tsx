"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import useThemeStore from "@/src/lib/store/theme";
import { handleClientError } from "@/src/lib/utils";
import { isClerkAPIResponseError, useClerk } from "@clerk/nextjs";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";

function MoreTab() {
    const { signOut } = useClerk();
    const router = useRouter();

    const setTheme = useThemeStore((state) => state.setTheme);
    const theme = useThemeStore((state) => state.theme);

    const handleThemeChange = () => {
        if (theme === "dark") {
            setTheme("light");
            localStorage.setItem("theme", "light");
        } else {
            setTheme("dark");
            localStorage.setItem("theme", "dark");
        }
    };

    const { mutate: handleLogout } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Logging out...");
            return { toastId };
        },
        mutationFn: async () => {
            await signOut();
        },
        onSuccess: (_, __, ctx) => {
            toast.success("See you soon!", {
                id: ctx?.toastId,
            });
            router.push("/");
        },
        onError: (err, _, ctx) => {
            isClerkAPIResponseError(err)
                ? toast.error(
                      err.errors[0].longMessage ?? DEFAULT_ERROR_MESSAGE,
                      {
                          id: ctx?.toastId,
                      }
                  )
                : handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Dropdown
            classNames={{
                content: "mb-0",
            }}
        >
            <DropdownTrigger>
                <div className="flex cursor-pointer items-center gap-4 rounded-lg p-2 md:p-4 md:px-3 md:hover:bg-default-100">
                    <Icons.menu className="h-6 w-6" />
                    <p className="hidden md:block">More</p>
                </div>
            </DropdownTrigger>

            <DropdownMenu>
                <DropdownSection showDivider>
                    <DropdownItem href="/settings">
                        <div className="flex items-center gap-3 rounded-md p-2 px-1">
                            <Icons.settings className="h-5 w-5" />
                            <p>Settings</p>
                        </div>
                    </DropdownItem>

                    <DropdownItem onClick={handleThemeChange}>
                        <div className="flex items-center gap-3 rounded-md p-2 px-1">
                            {theme === "dark" ? (
                                <Icons.sun className="h-5 w-5" />
                            ) : (
                                <Icons.moon className="h-5 w-5" />
                            )}
                            <p>
                                Switch to {theme === "dark" ? "Light" : "Dark"}
                            </p>
                        </div>
                    </DropdownItem>

                    <DropdownItem href="/report">
                        <div className="flex items-center gap-3 rounded-md p-2 px-1">
                            <Icons.warning className="h-5 w-5" />
                            <p>Report an issue</p>
                        </div>
                    </DropdownItem>
                </DropdownSection>

                <DropdownItem onClick={() => handleLogout()}>
                    <div className="rounded-md p-2 px-1">
                        <p>Sign Out</p>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}

export default MoreTab;
