import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your PeerAmp account.",
};

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex h-screen flex-col items-center justify-center overflow-x-hidden">
            <main className="flex h-full w-full flex-col md:flex-row-reverse">
                {children}
            </main>
        </div>
    );
}

export default Layout;
