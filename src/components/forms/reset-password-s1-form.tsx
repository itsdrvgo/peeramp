"use client";

import { EmailData, emailSchema } from "@/src/lib/validation/auth";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";

function ResetPasswordS1Form() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const { signIn, isLoaded } = useSignIn();

    const form = useForm<EmailData>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: EmailData) => {
        if (!isLoaded)
            return toast.error("Authentication service is not loaded!");

        setIsLoading(true);
        const toastId = toast.loading("Validating, please wait...");

        try {
            const res = await signIn.create({
                strategy: "reset_password_email_code",
                identifier: data.email,
            });

            switch (res.status) {
                case "needs_first_factor":
                    {
                        toast.success(
                            "Verification code sent to your email, " +
                                res.userData.firstName +
                                "!",
                            {
                                id: toastId,
                            }
                        );
                        router.push("/signin/reset-password/step2");
                    }
                    break;

                default:
                    console.log(JSON.stringify(res, null, 2));
                    break;
            }
        } catch (err) {
            const unknownError = "Something went wrong, please try again!";

            isClerkAPIResponseError(err)
                ? toast.error(err.errors[0]?.longMessage ?? unknownError, {
                      id: toastId,
                  })
                : toast.error(unknownError, {
                      id: toastId,
                  });

            return;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form
                className="grid gap-4"
                onSubmit={(...args) => form.handleSubmit(onSubmit)(...args)}
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    inputMode="email"
                                    size="sm"
                                    radius="sm"
                                    placeholder="ryomensukuna@jjk.jp"
                                    isDisabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    className="bg-default-700 font-semibold text-white dark:bg-primary-900 dark:text-black"
                    type="submit"
                    radius="sm"
                    isDisabled={isLoading}
                    isLoading={isLoading}
                >
                    {isLoading ? "Validating..." : "Send Code"}
                </Button>
            </form>
        </Form>
    );
}

export default ResetPasswordS1Form;
