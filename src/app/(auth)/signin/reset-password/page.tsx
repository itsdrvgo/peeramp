import LogoSection from "@/src/components/auth/logo-section";
import ResetPasswordStep1Section from "@/src/components/auth/reset-password/step1-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password - Step 1 | PeerAmp",
    description: "Enter your email address to receive a verification code.",
};

function Page() {
    return (
        <>
            <LogoSection />
            <ResetPasswordStep1Section />
        </>
    );
}

export default Page;
