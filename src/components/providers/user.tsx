"use client";

import { RootLayoutProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import Sidebar from "../global/sidebar/sidebar";
import SyncAccount from "../ui/sync";

function UserProvider({ children }: RootLayoutProps) {
    const { isLoaded, user, isSignedIn } = useUser();

    if (isLoaded && user && isSignedIn)
        if (
            ![
                "bio",
                "category",
                "gender",
                "type",
                "usernameChangedAt",
                "socials",
            ].every((key) => key in user.publicMetadata)
        )
            return <SyncAccount user={user} />;

    return (
        <Sidebar>
            <main className="flex-1 overflow-y-scroll md:min-h-screen">
                {children}
            </main>
        </Sidebar>
    );
}

export default UserProvider;
