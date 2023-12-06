"use client";

import { Icons } from "@/src/components/icons/icons";
import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import { handleClientError } from "@/src/lib/utils";
import { Visibility } from "@/src/lib/validation/amp";
import { UserResource } from "@clerk/types";
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
import { EmojiStyle, Theme } from "emoji-picker-react";
import { LucideIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const DynamicEmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
});

interface PageProps {
    amp: Amp;
    user: UserResource;
    onClose: () => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

function EditAmpModal({ amp, user, onClose, isOpen, onOpenChange }: PageProps) {
    const router = useRouter();

    const [visibility, setVisibility] = useState<Selection>(
        new Set([amp.visibility])
    );
    const [iconString, setIconString] = useState<keyof typeof Icons>("globe");
    const [Icon, setIcon] = useState<LucideIcon>(Icons.globe);
    const [content, setContent] = useState(amp.content);
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

    const { mutate: handleAmpEdit } = trpc.amp.editAmp.useMutation({
        onMutate: () => {
            toast.success("Your amp will be edited shortly...");
            onClose();
        },
        onSuccess: () => {
            toast.success("Your amp has been edited");
            router.refresh();
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={() => {
                onClose();
                setContent(amp.content);
                setIsEmojiPickerOpen(false);
            }}
            className="overflow-visible"
            placement="center"
        >
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Edit Your Amp</ModalHeader>

                        <ModalBody>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <Avatar
                                            src={user.imageUrl}
                                            alt={user.username!}
                                        />
                                    </div>

                                    <div className="w-full space-y-1">
                                        <p className="font-semibold">
                                            {user.username!}
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
                                                    setContent(
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
                                    "What are you thinking, " +
                                    user.firstName +
                                    "?"
                                }
                                variant="underlined"
                                value={content}
                                onValueChange={setContent}
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
                                color="danger"
                                variant="light"
                                onPress={close}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                variant="flat"
                                onPress={() => {
                                    handleAmpEdit({
                                        ampId: amp.id,
                                        content: content,
                                        creatorId: amp.creatorId,
                                        visibility: Array.from(
                                            visibility
                                        ).toString() as Visibility,
                                    });
                                    close();
                                }}
                            >
                                Save
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default EditAmpModal;
