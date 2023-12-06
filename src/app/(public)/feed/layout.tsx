import UserProvider from "@/src/components/providers/user";
import { RootLayoutProps } from "@/src/types";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home",
    description: "View your feed",
};

function Layout({ children }: RootLayoutProps) {
    return <UserProvider>{children}</UserProvider>;
}

export default Layout;
