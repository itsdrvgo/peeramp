import UserProvider from "@/src/components/providers/user";
import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile",
    description: "View your profile",
};

function Layout({ children }: RootLayoutProps) {
    return <UserProvider>{children}</UserProvider>;
}

export default Layout;
