import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Create an account",
        template: "%s | PeerAmp",
    },
    description: "Create an account to start using PeerAmp.",
};

function Layout({ children }: RootLayoutProps) {
    return (
        <main className="flex h-screen w-full flex-col items-center justify-center md:flex-row-reverse">
            {children}
        </main>
    );
}

export default Layout;
