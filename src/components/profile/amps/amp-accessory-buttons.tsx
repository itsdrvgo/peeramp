"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { cn } from "@/src/lib/utils";
import { DefaultProps } from "@/src/types";
import { Button } from "@nextui-org/react";
import { Icons } from "../../icons/icons";

interface PageProps extends DefaultProps {
    amp: Amp;
}

function AmpAccessoryButtons({ amp, className, ...props }: PageProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-2",
                {
                    hidden: amp.status === "draft",
                },
                className
            )}
            {...props}
        >
            <Button
                isIconOnly
                radius="full"
                variant="light"
                size="sm"
                startContent={<Icons.comment className="h-4 w-4" />}
            />

            <Button
                isIconOnly
                radius="full"
                variant="light"
                size="sm"
                startContent={<Icons.repeat className="h-4 w-4" />}
            />

            <Button
                isIconOnly
                radius="full"
                variant="light"
                size="sm"
                startContent={<Icons.heart className="h-4 w-4" />}
            />

            <Button
                isIconOnly
                radius="full"
                variant="light"
                size="sm"
                startContent={<Icons.analytics className="h-4 w-4" />}
            />

            <Button
                isIconOnly
                radius="full"
                variant="light"
                size="sm"
                startContent={<Icons.bookmark className="h-4 w-4" />}
            />
        </div>
    );
}

export default AmpAccessoryButtons;
