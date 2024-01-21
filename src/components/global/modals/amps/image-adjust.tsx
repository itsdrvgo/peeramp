"use client";

import { Icons } from "@/src/components/icons/icons";
import { cn } from "@/src/lib/utils";
import { Preset, presets } from "@/src/lib/validation/image";
import { DefaultProps } from "@/src/types";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react";
import { Dispatch, RefObject, SetStateAction } from "react";
import {
    FixedCropper,
    FixedCropperRef,
    ImageRestriction,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

type FixedCropperProps = {
    type: "fixed";
    cropperRef: RefObject<FixedCropperRef>;
    imageFile: ExtendedFile | null;
    preset: Preset;
};

type NonFixedCropperProps = {
    type: "non-fixed";
    cropperRef: RefObject<FixedCropperRef>;
    imageFile: ExtendedFile | null;
    preset: Preset;
    setPreset: Dispatch<SetStateAction<Preset>>;
};

type PageProps = DefaultProps & (FixedCropperProps | NonFixedCropperProps);

function ImageAdjust({
    className,
    imageFile,
    preset,
    cropperRef,
    ...props
}: PageProps) {
    return (
        <div className={cn("space-y-4", className)} {...props}>
            <FixedCropper
                className="rounded-lg"
                ref={cropperRef}
                src={imageFile?.url}
                stencilProps={{
                    handlers: false,
                    lines: false,
                    movable: false,
                    resizable: false,
                }}
                stencilSize={(x) => {
                    return {
                        width: preset === "original" ? x.imageSize.width : 640,
                        height:
                            preset === "portrait"
                                ? 800
                                : preset === "landscape"
                                  ? 360
                                  : preset === "square"
                                    ? 640
                                    : x.imageSize.height,
                    };
                }}
                imageRestriction={ImageRestriction.stencil}
            />

            <div className="grid grid-flow-col justify-items-stretch gap-2">
                {props.type === "non-fixed" && (
                    <div className="flex justify-center">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    radius="full"
                                    variant="light"
                                    startContent={
                                        <Icons.fullscreen className="size-4" />
                                    }
                                />
                            </DropdownTrigger>

                            <DropdownMenu
                                onAction={(key) =>
                                    props.setPreset(key.toString() as Preset)
                                }
                            >
                                {presets._def.options.map((preset) => (
                                    <DropdownItem
                                        key={preset.value}
                                        className="capitalize"
                                    >
                                        {preset.value}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.crosshair className="size-4" />}
                        onPress={() => {
                            const defState =
                                cropperRef.current?.getDefaultState()
                                    ?.coordinates;
                            if (defState)
                                cropperRef.current?.setCoordinates(defState);
                        }}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.zoomIn className="size-4" />}
                        onPress={() => cropperRef.current?.zoomImage(1.1)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.zoomOut className="size-4" />}
                        onPress={() => cropperRef.current?.zoomImage(0.9)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.rotateCcw className="size-4" />}
                        onPress={() => cropperRef.current?.rotateImage(-90)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.rotateCw className="size-4" />}
                        onPress={() => cropperRef.current?.rotateImage(90)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.flipHor className="size-4" />}
                        onPress={() => cropperRef.current?.flipImage(true)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.flipVert className="size-4" />}
                        onPress={() =>
                            cropperRef.current?.flipImage(false, true)
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default ImageAdjust;
