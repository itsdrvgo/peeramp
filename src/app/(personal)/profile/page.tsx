"use client";

import { useClerk } from "@clerk/nextjs";

function Page() {
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        await signOut();
    };

    return <button onClick={handleSignOut}>Logout</button>;
}

export default Page;
