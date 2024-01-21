"use client";

import { Input, InputProps } from "@nextui-org/react";
import { useState } from "react";
import { Icons } from "../icons/icons";

interface PasswordInputProps extends InputProps {
    isToggleable?: boolean;
}

function PasswordInput({ isToggleable = true, ...props }: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <Input
            placeholder={isVisible && isToggleable ? "12345678" : "••••••••"}
            type={isVisible && isToggleable ? "text" : "password"}
            endContent={
                isToggleable && (
                    <button
                        type="button"
                        className="focus:outline-none"
                        onClick={() => setIsVisible(!isVisible)}
                    >
                        {isVisible ? (
                            <Icons.hide className="size-5 opacity-80" />
                        ) : (
                            <Icons.view className="size-5 opacity-80" />
                        )}
                    </button>
                )
            }
            {...props}
        />
    );
}

export default PasswordInput;
