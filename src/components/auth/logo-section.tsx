"use client";

import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { useRouter } from "next/navigation";
import ThemeSwitch from "../global/buttons/theme-button";
import PeerAmp from "../global/svgs/PeerAmp";

function LogoSection({ className, ...props }: DefaultProps) {
    const router = useRouter();

    return (
        <section
            className={cn(
                "relative flex w-full items-center px-4 md:w-1/3 md:px-0",
                className
            )}
            {...props}
        >
            <div className="relative w-full min-w-min max-w-sm md:left-[-26px]">
                <button
                    className="flex cursor-pointer items-center gap-1 bg-background py-4 text-4xl font-semibold"
                    onClick={() => router.push("/")}
                >
                    <PeerAmp height={50} width={50} />
                    <p>PeerAmp</p>
                </button>
            </div>

            <ThemeSwitch className="absolute right-5 top-5 rounded-md border border-black/20 bg-default-100 dark:border-white/10" />
        </section>
    );
}

export default LogoSection;
