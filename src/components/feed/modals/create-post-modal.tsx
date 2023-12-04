"use client";

import { createAmp } from "@/src/actions/amp";
import { cFetch, handleClientError } from "@/src/lib/utils";
import { Status, Visibility } from "@/src/types";
import {
    Avatar,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    Selection,
    SelectItem,
    Textarea,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { EmojiStyle, Theme } from "emoji-picker-react";
import { LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Icons } from "../../icons/icons";

const DynamicEmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
});

interface PageProps {
    userId: string;
    image: string;
    username: string;
    firstName: string;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    metadata: UserPublicMetadata;
}

function CreatePostModal({
    onClose,
    isOpen,
    onOpenChange,
    userId,
    image,
    username,
    firstName,
    metadata,
}: PageProps) {
    const router = useRouter();

    const [visibility, setVisibility] = useState<Selection>(
        new Set(["everyone"])
    );
    const [iconString, setIconString] = useState<keyof typeof Icons>("globe");
    const [Icon, setIcon] = useState<LucideIcon>(Icons.globe);
    const [text, setText] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node)
            ) {
                setIsEmojiPickerOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [emojiPickerRef]);

    useEffect(() => {
        switch (Array.from(visibility).toString()) {
            case "everyone":
                setIconString("globe");
                break;
            case "following":
                setIconString("users");
                break;
            case "peers":
                setIconString("refresh");
                break;
            default:
                setIconString("lock");
                break;
        }
        setIcon(Icons[iconString] as LucideIcon);
    }, [iconString, visibility]);

    const { mutate: handleCreateAmp, isPending } = useMutation({
        onMutate: ({ status }: { status: Status }) => {
            const toastId = toast.loading(
                status === "draft"
                    ? "Saving your amp..."
                    : "Posting your amp..."
            );
            return { toastId };
        },
        mutationFn: async ({ status }: { status: Status }) => {
            await Promise.all([
                createAmp({
                    content: text,
                    creatorId: userId,
                    visibility: Array.from(visibility).toString() as Visibility,
                    status,
                }),
                cFetch(`/api/users/${userId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        ...metadata,
                        ampCount: metadata.ampCount + 1,
                    }),
                }),
            ]);
        },
        onSuccess: (_, { status }: { status: Status }, ctx) => {
            toast.success(
                status === "draft"
                    ? "Your amp has been saved"
                    : "Your amp has been posted",
                {
                    id: ctx?.toastId,
                }
            );
            onClose();
            setText("");
            setVisibility(new Set(["everyone"]));
            setIsEmojiPickerOpen(false);
            router.refresh();
        },
        onError: (err, _, ctx) => {
            handleClientError(err, ctx?.toastId);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                onClose();
                setIsEmojiPickerOpen(false);
            }}
            onOpenChange={onOpenChange}
            className="overflow-visible"
            placement="center"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader>Create Post</ModalHeader>

                        <ModalBody>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <Avatar src={image} alt={username} />
                                    </div>

                                    <div className="w-full space-y-1">
                                        <p className="font-semibold">
                                            {username}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-center gap-1">
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        variant="light"
                                        size="sm"
                                        startContent={
                                            <Icons.media className="h-5 w-5 text-primary" />
                                        }
                                    />
                                    <Button
                                        isIconOnly
                                        radius="full"
                                        variant="light"
                                        size="sm"
                                        startContent={
                                            <Icons.smile className="h-5 w-5 text-primary" />
                                        }
                                        onPress={() =>
                                            setIsEmojiPickerOpen(
                                                !isEmojiPickerOpen
                                            )
                                        }
                                    />
                                    {isEmojiPickerOpen && (
                                        <div
                                            className="absolute bottom-10 left-0"
                                            ref={emojiPickerRef}
                                        >
                                            <DynamicEmojiPicker
                                                theme={Theme.DARK}
                                                emojiStyle={EmojiStyle.TWITTER}
                                                previewConfig={{
                                                    showPreview: false,
                                                }}
                                                searchDisabled={true}
                                                lazyLoadEmojis={true}
                                                onEmojiClick={(emoji) => {
                                                    setText(
                                                        (prev) =>
                                                            prev + emoji.emoji
                                                    );
                                                    textareaRef.current?.focus();
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Textarea
                                autoFocus
                                placeholder={
                                    "What are you thinking, " + firstName + "?"
                                }
                                variant="underlined"
                                value={text}
                                onValueChange={setText}
                                ref={textareaRef}
                            />

                            <div className="flex items-center gap-2">
                                <p className="text-sm">
                                    Who can see this post?
                                </p>

                                <Select
                                    size="sm"
                                    disallowEmptySelection
                                    selectedKeys={visibility}
                                    onSelectionChange={setVisibility}
                                    startContent={<Icon className="h-4 w-4" />}
                                    className="max-w-xs"
                                    radius="sm"
                                >
                                    <SelectItem key="everyone">
                                        Everyone
                                    </SelectItem>
                                    <SelectItem key="following">
                                        People You Follow
                                    </SelectItem>
                                    <SelectItem key="peers">
                                        Your Peers
                                    </SelectItem>
                                    <SelectItem key="only-me">
                                        Only Me
                                    </SelectItem>
                                </Select>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                radius="sm"
                                className="font-semibold"
                                isDisabled={!text || isPending}
                                onPress={() =>
                                    handleCreateAmp({
                                        status: "draft",
                                    })
                                }
                            >
                                Save as Draft
                            </Button>
                            <Button
                                className="font-semibold dark:text-black"
                                isDisabled={!text || isPending}
                                color="primary"
                                radius="sm"
                                onPress={() =>
                                    handleCreateAmp({
                                        status: "published",
                                    })
                                }
                            >
                                Post
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default CreatePostModal;
