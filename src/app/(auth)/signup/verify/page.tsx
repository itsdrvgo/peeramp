import LogoSection from "@/src/components/auth/logo-section";
import VerifiySection from "@/src/components/auth/verify/verify-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verification",
    description: "Verify your account to start using PeerAmp.",
};

function Page() {
    return (
        <>
            <LogoSection />
            <VerifiySection />
        </>
    );
}

export default Page;
