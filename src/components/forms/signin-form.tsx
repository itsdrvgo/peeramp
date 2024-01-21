"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { handleClientError, wait } from "@/src/lib/utils";
import { LoginData, loginSchema } from "@/src/lib/validation/auth";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Link } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
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
import PasswordInput from "../ui/password-input";

function SignInForm() {
    const router = useRouter();
    const { signIn, isLoaded, setActive } = useSignIn();

    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate: onSubmit, isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Signing in, please wait...");
            return { toastId };
        },
        mutationFn: async (data: LoginData) => {
            if (!isLoaded)
                throw new Error("Authentication service is not loaded!");

            const res = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            return res;
        },
        onSuccess: async (data, _, ctx) => {
            switch (data.status) {
                case "complete":
                    {
                        toast.success(
                            "Welcome back, " + data.userData.firstName + "!",
                            {
                                id: ctx?.toastId,
                            }
                        );
                        await setActive!({
                            session: data.createdSessionId,
                        });
                        await wait(1000);
                        router.push("/profile");
                    }
                    break;

                default:
                    console.log(data);
            }
        },
        onError: (err, _, ctx) => {
            isClerkAPIResponseError(err)
                ? toast.error(
                      err.errors[0]?.longMessage ?? DEFAULT_ERROR_MESSAGE,
                      {
                          id: ctx?.toastId,
                      }
                  )
                : handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Form {...form}>
            <form
                className="space-y-4"
                onSubmit={(...args) =>
                    form.handleSubmit((data) => onSubmit(data))(...args)
                }
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
                                    isDisabled={isPending}
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
                                <PasswordInput
                                    size="sm"
                                    radius="sm"
                                    isDisabled={isPending}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <Link
                        as={NextLink}
                        href="/signin/reset-password"
                        className="text-sm"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    className="bg-default-700 font-semibold text-white dark:bg-primary-900 dark:text-black"
                    type="submit"
                    fullWidth
                    radius="sm"
                    isDisabled={isPending}
                    isLoading={isPending}
                >
                    {isPending ? "Signing In" : "Sign In"}
                </Button>
            </form>
        </Form>
    );
}

export default SignInForm;
