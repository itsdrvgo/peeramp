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

interface PageProps extends DefaultProps {
    imageFile: ExtendedFile;
    preset: Preset;
    setPreset: Dispatch<SetStateAction<Preset>>;
    cropperRef: RefObject<FixedCropperRef>;
}

function ImageAdjust({
    className,
    imageFile,
    preset,
    setPreset,
    cropperRef,
    ...props
}: PageProps) {
    return (
        <div className={cn("space-y-4", className)} {...props}>
            <FixedCropper
                className="rounded-lg"
                ref={cropperRef}
                src={imageFile.url}
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
                <div className="flex justify-center">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                isIconOnly
                                size="sm"
                                radius="full"
                                variant="light"
                                startContent={
                                    <Icons.fullscreen className="h-4 w-4" />
                                }
                            />
                        </DropdownTrigger>

                        <DropdownMenu
                            onAction={(key) =>
                                setPreset(key.toString() as Preset)
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

                <div className="flex justify-center">
                    <Button
                        isIconOnly
                        size="sm"
                        radius="full"
                        variant="light"
                        isDisabled={!cropperRef.current}
                        startContent={<Icons.crosshair className="h-4 w-4" />}
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
                        startContent={<Icons.zoomIn className="h-4 w-4" />}
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
                        startContent={<Icons.zoomOut className="h-4 w-4" />}
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
                        startContent={<Icons.rotateCcw className="h-4 w-4" />}
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
                        startContent={<Icons.rotateCw className="h-4 w-4" />}
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
                        startContent={<Icons.flipHor className="h-4 w-4" />}
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
                        startContent={<Icons.flipVert className="h-4 w-4" />}
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
