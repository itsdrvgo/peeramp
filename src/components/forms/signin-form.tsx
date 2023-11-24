"use client";

import { LoginData, loginSchema } from "@/src/lib/validation/auth";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link } from "@nextui-org/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Icons } from "../icons/icons";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";

function SignInForm() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const { signIn, isLoaded, setActive } = useSignIn();

    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginData) => {
        if (!isLoaded)
            return toast.error("Authentication service is not loaded!");

        const toastId = toast.loading("Signing in, please wait...");

        try {
            const res = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            switch (res.status) {
                case "complete":
                    {
                        toast.success(
                            "Welcome back, " + res.userData.firstName + "!",
                            {
                                id: toastId,
                            }
                        );
                        await setActive({
                            session: res.createdSessionId,
                        });
                        router.push("/profile");
                    }
                    break;

                default:
                    console.log(res);
            }
        } catch (err) {
            const unknownError = "Something went wrong, please try again.";

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
                className="flex flex-col gap-4"
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

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    size="sm"
                                    radius="sm"
                                    placeholder="********"
                                    type={isVisible ? "text" : "password"}
                                    isDisabled={isLoading}
                                    endContent={
                                        <button
                                            type="button"
                                            className="focus:outline-none"
                                            onClick={() =>
                                                setIsVisible(!isVisible)
                                            }
                                        >
                                            {isVisible ? (
                                                <Icons.hide className="h-5 w-5 text-black/60 dark:text-white/60" />
                                            ) : (
                                                <Icons.view className="h-5 w-5 text-black/60 dark:text-white/60" />
                                            )}
                                        </button>
                                    }
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Link
                    as={NextLink}
                    href="/signin/reset-password"
                    className="text-sm hover:text-black/80 dark:hover:text-white/80"
                >
                    Forgot password?
                </Link>

                <Button
                    className="bg-default-700 font-semibold text-white dark:bg-primary-900 dark:text-black"
                    type="submit"
                    radius="sm"
                    isDisabled={isLoading}
                    isLoading={isLoading}
                >
                    {isLoading ? <>Signing In</> : <>Sign In</>}
                </Button>
            </form>
        </Form>
    );
}

export default SignInForm;
