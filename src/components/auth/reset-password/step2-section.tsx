"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import ResetPasswordS2Form from "../../forms/reset-password-s2-form";

function ResetPasswordStep2Section({ className, ...props }: DefaultProps) {
    return (
        <section
            className={cn(
                "size-full border-black/10 p-4 dark:border-white/10 md:flex md:w-2/3 md:items-center md:justify-center md:border-r md:px-4 md:py-0",
                className
            )}
            {...props}
        >
            <div className="m-auto w-full min-w-min max-w-sm space-y-5 px-2 md:w-7/12 md:px-0">
                <div className="space-y-1">
                    <p className="text-2xl font-bold">
                        Reset Password - Step 2
                    </p>
                    <p className="text-sm opacity-80">
                        Enter your new password and the verification code you
                        received in your email.
                    </p>
                </div>

                <ResetPasswordS2Form />
            </div>
        </section>
    );
}

export default ResetPasswordStep2Section;
