"use client";

import { DEFAULT_ERROR_MESSAGE } from "@/src/config/const";
import { handleClientError, wait } from "@/src/lib/utils";
import {
    VerificationCodeData,
    verificationCodeSchema,
} from "@/src/lib/validation/auth";
import { isClerkAPIResponseError, useSignUp } from "@clerk/nextjs";
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

function VerifyForm() {
    const router = useRouter();
    const { signUp, isLoaded, setActive } = useSignUp();

    const form = useForm<VerificationCodeData>({
        resolver: zodResolver(verificationCodeSchema),
        defaultValues: {
            verificationCode: "",
        },
    });

    const { mutate: onSubmit, isPending } = useMutation({
        onMutate: () => {
            const toastId = toast.loading("Verifying, please wait...");
            return { toastId };
        },
        mutationFn: async (data: VerificationCodeData) => {
            if (!isLoaded)
                throw new Error("Authentication service is not loaded!");

            const res = await signUp.attemptEmailAddressVerification({
                code: data.verificationCode,
            });

            return res;
        },
        onSuccess: async (data, _, ctx) => {
            switch (data.status) {
                case "complete":
                    {
                        toast.success(
                            "Welcome to PeerAmp, " + data.firstName + "!",
                            {
                                id: ctx?.toastId,
                            }
                        );
                        await setActive!({
                            session: data.createdSessionId,
                        });
                        await wait(1000);
                        router.push("/profile/edit");
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
                    {isPending ? "Verifying" : "Submit"}
                </Button>
            </form>
        </Form>
    );
}

export default VerifyForm;
