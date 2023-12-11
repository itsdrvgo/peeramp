"use client";

import { trpc } from "@/src/lib/trpc/client";
import {
    cn,
    extractYTVideoId,
    handleClientError,
    isYouTubeVideo,
} from "@/src/lib/utils";
import { Status, Visibility } from "@/src/lib/validation/amp";
import {
    Avatar,
    Button,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    Selection,
    SelectItem,
    Spinner,
    Textarea,
} from "@nextui-org/react";
import { EmojiStyle, Theme } from "emoji-picker-react";
import { LucideIcon } from "lucide-react";
import { nanoid } from "nanoid";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Icons } from "../../icons/icons";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

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
}

function CreateAmpModal({
    onClose,
    isOpen,
    onOpenChange,
    userId,
    image,
    username,
    firstName,
}: PageProps) {
    const [visibility, setVisibility] = useState<Selection>(
        new Set(["everyone"])
    );
    const [iconString, setIconString] = useState<keyof typeof Icons>("globe");
    const [Icon, setIcon] = useState<LucideIcon>(Icons.globe);
    const [text, setText] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [link, setLink] = useState("");

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLink(text.match(/https?:\/\/[^\s]+/g)?.[0] ?? "");
    }, [text]);

    const { data: linkPreview, isLoading: isLinkLoading } =
        trpc.link.getMetadata.useQuery({
            link,
        });

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

    const { mutate: handleCreateAmp } = trpc.amp.createAmp.useMutation({
        onMutate: ({ status }: { status: Status }) => {
            toast.success(
                status === "draft"
                    ? "Your amp will be saved as a draft"
                    : "Your amp will be posted soon"
            );
            onClose();
            setText("");
            setVisibility(new Set(["everyone"]));
            setIsEmojiPickerOpen(false);
        },
        onSuccess: (data, { status }: { status: Status }) => {
            status === "draft"
                ? toast.success("Your amp has been saved")
                : toast.success(
                      (t) => (
                          <span>
                              Your Amp is now live at{" "}
                              <Link
                                  underline="always"
                                  href={
                                      "/amps?uId=" + userId + "&aId=" + data.id
                                  }
                                  onPress={() => toast.dismiss(t.id)}
                              >
                                  here
                              </Link>
                              {"!"}
                          </span>
                      ),
                      {
                          duration: 10000,
                      }
                  );
        },
        onError: (err) => {
            handleClientError(err);
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

                            {isLinkLoading ? (
                                <div className="flex justify-center py-2">
                                    <Spinner size="sm" />
                                </div>
                            ) : (
                                linkPreview &&
                                Object.keys(linkPreview).length > 0 && (
                                    <div
                                        className={cn(
                                            "rounded-xl bg-default-100 p-1",
                                            linkPreview.image
                                                ? "space-y-2 pb-3"
                                                : "space-y-0 px-2 py-3"
                                        )}
                                    >
                                        {isYouTubeVideo(linkPreview.url) ? (
                                            <div className="overflow-hidden rounded-lg">
                                                <LiteYouTubeEmbed
                                                    id={
                                                        extractYTVideoId(
                                                            linkPreview.url
                                                        ) ?? ""
                                                    }
                                                    title={
                                                        linkPreview.title ??
                                                        "video_" + nanoid()
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            linkPreview.image && (
                                                <div>
                                                    <Image
                                                        radius="sm"
                                                        src={linkPreview.image}
                                                        alt={
                                                            linkPreview.title ??
                                                            "image_" + nanoid()
                                                        }
                                                    />
                                                </div>
                                            )
                                        )}

                                        <div className="px-1">
                                            {linkPreview.title && (
                                                <p className="font-semibold">
                                                    {linkPreview.title.length >
                                                    100
                                                        ? linkPreview.title.slice(
                                                              0,
                                                              100
                                                          ) + "..."
                                                        : linkPreview.title}
                                                </p>
                                            )}
                                            {linkPreview.description && (
                                                <p className="text-sm opacity-60">
                                                    {linkPreview.description
                                                        .length > 100
                                                        ? linkPreview.description.slice(
                                                              0,
                                                              100
                                                          ) + "..."
                                                        : linkPreview.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}

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
                                isDisabled={!text}
                                onPress={() =>
                                    handleCreateAmp({
                                        status: "draft",
                                        content: text,
                                        creatorId: userId,
                                        visibility: Array.from(
                                            visibility
                                        ).toString() as Visibility,
                                        metadata: linkPreview ?? null,
                                    })
                                }
                            >
                                Save as Draft
                            </Button>
                            <Button
                                className="font-semibold dark:text-black"
                                isDisabled={!text}
                                color="primary"
                                radius="sm"
                                onPress={() =>
                                    handleCreateAmp({
                                        status: "published",
                                        content: text,
                                        creatorId: userId,
                                        visibility: Array.from(
                                            visibility
                                        ).toString() as Visibility,
                                        metadata: linkPreview ?? null,
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

export default CreateAmpModal;
