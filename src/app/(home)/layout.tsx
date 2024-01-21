import Footer from "@/src/components/global/footer/footer";
import NavbarHome from "@/src/components/global/navbar/navbar-home";
import { RootLayoutProps } from "@/src/types";

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <NavbarHome />
            <main className="flex flex-1 items-center">{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;
