"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { handleClientError, wait } from "@/src/lib/utils";
import {
    ResetPasswordData,
    resetPasswordSchema,
} from "@/src/lib/validation/auth";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
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

function ResetPasswordS2Form() {
    const router = useRouter();
    const { signIn, isLoaded, setActive } = useSignIn();

    const form = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            verificationCode: "",
        },
    });

    const { mutate: onSubmit, isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Validating, please wait...");
            return { toastId };
        },
        mutationFn: async (data: ResetPasswordData) => {
            if (!isLoaded)
                throw new Error("Authentication service is not loaded!");

            const res = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code: data.verificationCode,
                password: data.password,
            });

            return res;
        },
        onSuccess: async (data, _, ctx) => {
            switch (data.status) {
                case "complete":
                    {
                        toast.success(
                            "Your password has been reset, " +
                                data.userData.firstName +
                                "!",
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
                    console.log(JSON.stringify(data, null, 2));
                    break;
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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    size="sm"
                                    radius="sm"
                                    placeholder="********"
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
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                                <PasswordInput
                                    size="sm"
                                    radius="sm"
                                    placeholder="********"
                                    isDisabled={isPending}
                                    isToggleable={false}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="verificationCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Code</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    size="sm"
                                    radius="sm"
                                    placeholder="132748"
                                    isDisabled={isPending}
                                    {...field}
                                    onChange={(e) => {
                                        if (e.target.value.match(/^[0-9]*$/))
                                            form.setValue(
                                                "verificationCode",
                                                e.target.value
                                            );
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    className="bg-default-700 font-semibold text-white dark:bg-primary-900 dark:text-black"
                    type="submit"
                    fullWidth
                    radius="sm"
                    isDisabled={isPending}
                    isLoading={isPending}
                >
                    {isPending ? "Validating..." : "Reset Password"}
                </Button>
            </form>
        </Form>
    );
}

export default ResetPasswordS2Form;
