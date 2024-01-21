"use client";

import { Amp } from "@/src/lib/drizzle/schema";
import { trpc } from "@/src/lib/trpc/client";
import { cFetch, generateId, handleClientError } from "@/src/lib/utils";
import { Status, Visibility } from "@/src/lib/validation/amp";
import { ResponseData } from "@/src/lib/validation/response";
import { UploadFileResponse } from "@/src/types";
import { Button, Link, Selection } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

interface PageProps {
    text: string;
    amp?: Amp;
    userId: string;
    uploadedImages: ExtendedFile[];
    uploadedVideo: ExtendedFile | null;
    visibility: Selection;
    linkPreview:
        | {
              title: string | null | undefined;
              description: string | null | undefined;
              image: string | null | undefined;
              url: string;
          }
        | null
        | undefined;
    isPreviewVisible: boolean;
    onClose: () => void;
    setText: Dispatch<SetStateAction<string>>;
    setVisibility: Dispatch<SetStateAction<Selection>>;
    closeModal: () => void;
}

function AmpManageButtons({
    text,
    amp,
    userId,
    uploadedImages,
    uploadedVideo,
    visibility,
    linkPreview,
    isPreviewVisible,
    onClose,
    setText,
    setVisibility,
    closeModal,
}: PageProps) {
    const { mutate: handleCreateAmp } = trpc.amp.createAmp.useMutation({
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

    const { mutate: handleEditAmp } = trpc.amp.editAmp.useMutation({
        onSuccess: () => {
            amp
                ? amp.status === "draft"
                    ? toast.success("Your amp has been edited")
                    : toast.success(
                          (t) => (
                              <span>
                                  Your Amp is now live at{" "}
                                  <Link
                                      underline="always"
                                      href={
                                          "/amps?uId=" +
                                          amp.creatorId +
                                          "&aId=" +
                                          amp.id
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
                      )
                : toast.success("Your amp has been edited");
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    const { mutate: manageAmp } = useMutation({
        onMutate: () => {
            toast.success(
                "Your amp is being processed, this may take a few seconds"
            );
            onClose();
        },
        mutationFn: async () => {
            const formData = new FormData();
            formData.append("uploaderId", userId);

            let attachments: {
                files: UploadFileResponse[];
                type: "image" | "video";
            } | null = null;

            if (uploadedImages.length > 0) {
                await Promise.all(
                    uploadedImages.map(({ file }) =>
                        formData.append("images", file)
                    )
                );

                const res = await cFetch<
                    ResponseData<{
                        files: UploadFileResponse[];
                        type: "image";
                    }>
                >("/api/uploads/image", {
                    method: "POST",
                    body: formData,
                });

                if (res.message !== "OK") throw new Error(res.longMessage);
                if (!res.data?.files.length) throw new Error(res.longMessage);

                attachments = {
                    files: res.data.files,
                    type: "image",
                };
            } else if (uploadedVideo) {
                formData.append("video", uploadedVideo.file);

                const res = await cFetch<
                    ResponseData<{
                        files: UploadFileResponse[];
                        type: "video";
                    }>
                >("/api/uploads/video", {
                    method: "POST",
                    body: formData,
                });

                if (res.message !== "OK") throw new Error(res.longMessage);
                if (!res.data?.files.length) throw new Error(res.longMessage);

                attachments = {
                    files: res.data.files,
                    type: "video",
                };
            }

            if (amp)
                handleEditAmp({
                    ampId: amp.id,
                    content: text,
                    creatorId: amp.creatorId,
                    visibility: Array.from(visibility).toString() as Visibility,
                    metadata:
                        {
                            title: linkPreview?.title ?? null,
                            description: linkPreview?.description ?? null,
                            image: linkPreview?.image ?? null,
                            url: linkPreview?.url ?? "",
                            isVisible: isPreviewVisible,
                        } ?? null,
                });
            else
                handleCreateAmp({
                    status: "published",
                    content: text,
                    creatorId: userId,
                    visibility: Array.from(visibility).toString() as Visibility,
                    metadata:
                        {
                            title: linkPreview?.title ?? null,
                            description: linkPreview?.description ?? null,
                            image: linkPreview?.image ?? null,
                            url: linkPreview?.url ?? "",
                            isVisible: isPreviewVisible,
                        } ?? null,
                    attachments:
                        attachments?.files.map((file) => ({
                            id: generateId(),
                            type: attachments?.type ?? "image",
                            url: file.url,
                            key: file.key,
                            name: file.name,
                        })) ?? null,
                });
        },
        onSuccess: () => {
            setText("");
            setVisibility(new Set(["everyone"]));
        },
        onError: (err) => {
            handleClientError(err);
        },
    });

    return (
        <>
            <Button
                radius="sm"
                className="font-semibold"
                isDisabled={!text}
                onPress={() => (amp ? closeModal() : manageAmp())}
            >
                {amp ? "Cancel" : "Save as Draft"}
            </Button>
            <Button
                className="font-semibold dark:text-black"
                isDisabled={!text}
                color="primary"
                radius="sm"
                onPress={() => manageAmp()}
            >
                {amp ? "Edit" : "Post"}
            </Button>
        </>
    );
}

export default AmpManageButtons;
