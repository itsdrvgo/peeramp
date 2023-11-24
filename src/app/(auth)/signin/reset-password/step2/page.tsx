import LogoSection from "@/src/components/auth/logo-section";
import ResetPasswordStep2Section from "@/src/components/auth/reset-password/step2-section";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password - Step 2 | PeerAmp",
    description:
        "Enter your new password and the verification code you received in your email.",
};

function Page() {
    return (
        <>
            <LogoSection />
            <ResetPasswordStep2Section />
        </>
    );
}

export default Page;
