import Footer from "@/src/components/global/footer/footer";
import NavbarHome from "@/src/components/global/navbar/navbar-home";
import { RootLayoutProps } from "@/src/types";

function Layout({ children }: RootLayoutProps) {
    return (
        <div className="flex h-screen flex-col justify-between overflow-x-hidden">
            <NavbarHome />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;
