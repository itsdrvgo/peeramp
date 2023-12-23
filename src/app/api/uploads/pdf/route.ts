import { env } from "@/env.mjs";
import { cFetch, CResponse, handleError } from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { UploadFileResponse } from "@/src/types";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { NextRequest } from "next/server";
import { utapi } from "../../uploadthing/core";

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();

        const file = form.get("file");
        const uploaderId = form.get("uploaderId");

        if (!file || !uploaderId)
            return CResponse({
                message: "BAD_REQUEST",
                longMessage: "Missing file or uploaderId",
            });

        const user = await currentUser();
        if (!user)
            return CResponse({
                message: "UNAUTHORIZED",
                longMessage: "You must be logged in to upload files",
            });

        if (user.id !== uploaderId)
            return CResponse({
                message: "FORBIDDEN",
                longMessage: "You cannot upload files for other users",
            });

        const res = await cFetch<
            ResponseData<{
                file: UploadFileResponse;
                uploaderId: string;
            }>
        >(env.SOCKET_SERVER_URL + "/api/pdfs/compress", {
            method: "POST",
            body: form,
        });

        if (res.message !== "OK") return CResponse(res);
        if (!res.data) return CResponse(res);
        if (!res.data.file) return CResponse(res);

        const existingResume = user.publicMetadata.resume;
        if (existingResume && existingResume.key)
            await utapi.deleteFiles(existingResume.key);

        const { key, name, size, url } = res.data.file;

        await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
                ...user.publicMetadata,
                resume: {
                    key,
                    name,
                    size,
                    url,
                },
            },
        });

        return CResponse({
            message: "OK",
            data: {
                file: {
                    key,
                    name,
                    size,
                    url,
                },
            },
        });
    } catch (err) {
        return handleError(err);
    }
}
