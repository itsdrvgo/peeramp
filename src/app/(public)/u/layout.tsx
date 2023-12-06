import UserProvider from "@/src/components/providers/user";
import { RootLayoutProps } from "@/src/types";

function Layout({ children }: RootLayoutProps) {
    return <UserProvider>{children}</UserProvider>;
}

export default Layout;
