"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import SignUpForm from "../../forms/signup-form";

function SignupSection({ className, ...props }: DefaultProps) {
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
                    <p className="text-2xl font-bold">Create an account</p>
                    <p>
                        <span className="text-sm opacity-80">
                            Already have an account?{" "}
                        </span>
                        <Link as={NextLink} href="/signin" className="text-sm">
                            Sign in.
                        </Link>
                    </p>
                </div>

                <SignUpForm />
            </div>
        </section>
    );
}

export default SignupSection;
