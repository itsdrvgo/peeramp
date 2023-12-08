import { clerkClient, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { createUploadthing, UTApi } from "uploadthing/server";

const f = createUploadthing();
export const utapi = new UTApi();

export const customFileRouter = {
    resumeUpload: f({
        pdf: {
            maxFileSize: "512KB",
            maxFileCount: 1,
        },
    })
        .middleware(async () => {
            const user = await currentUser();
            if (!user) throw new Error("Unauthorized!");

            const existingResume = user.publicMetadata.resume;
            if (existingResume) await utapi.deleteFiles(existingResume.key);

            return {
                user,
            };
        })
        .onUploadError((err) => {
            console.log(err);

            return NextResponse.json({
                code: err.error.code,
                message: err.error.message,
            });
        })
        .onUploadComplete(async ({ file, metadata }) => {
            const { user } = metadata;

            await clerkClient.users.updateUserMetadata(user.id, {
                publicMetadata: {
                    ...user.publicMetadata,
                    resume: {
                        key: file.key,
                        name: file.name,
                        size: file.size,
                        url: file.url,
                    },
                },
            });
        }),
};

export type CustomFileRouter = typeof customFileRouter;
