"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import VerifyForm from "../../forms/verify-form";

function VerifySection({ className, ...props }: DefaultProps) {
    return (
        <section
            className={cn(
                "border-black/10 p-4 dark:border-white/10 md:flex md:w-2/3 md:items-center md:justify-center md:border-r md:px-4 md:py-0",
                className
            )}
            {...props}
        >
            <div className="m-auto w-full min-w-min max-w-sm space-y-5 px-2 md:w-7/12 md:px-0">
                <div className="space-y-1">
                    <p className="text-2xl font-bold">Verification</p>
                    <p className="text-sm text-black/80 dark:text-white/80">
                        Enter the verification code sent to your email.
                    </p>
                </div>

                <VerifyForm />
            </div>
        </section>
    );
}

export default VerifySection;
