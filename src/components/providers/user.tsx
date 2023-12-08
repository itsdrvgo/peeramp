"use client";

import { publicMetadataSchema } from "@/src/lib/validation/user";
import { RootLayoutProps } from "@/src/types";
import { useUser } from "@clerk/nextjs";
import Sidebar from "../global/sidebar/sidebar";
import SyncAccount from "../ui/sync";

function UserProvider({ children }: RootLayoutProps) {
    const { isLoaded, user, isSignedIn } = useUser();

    if (isLoaded && user && isSignedIn) {
        const parsed = publicMetadataSchema.safeParse(user.publicMetadata);
        if (!parsed.success) return <SyncAccount user={user} />;
    }

    return (
        <Sidebar>
            <main className="flex-1 overflow-y-scroll md:min-h-screen">
                {children}
            </main>
        </Sidebar>
    );
}

export default UserProvider;
