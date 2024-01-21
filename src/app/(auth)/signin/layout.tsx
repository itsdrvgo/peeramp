import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your PeerAmp account.",
};

function Layout({ children }: RootLayoutProps) {
    return (
        <main className="flex h-screen w-full flex-col items-center justify-center md:flex-row-reverse">
            {children}
        </main>
    );
}

export default Layout;
