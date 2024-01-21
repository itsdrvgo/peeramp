import { env } from "@/env.mjs";
import { cFetch, CResponse, handleError } from "@/src/lib/utils";
import { ResponseData } from "@/src/lib/validation/response";
import { UploadFileResponse } from "@/src/types";
import { currentUser } from "@clerk/nextjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();

        const file = form.get("images");
        const uploaderId = form.get("uploaderId");

        if (!file || !uploaderId)
            return CResponse({
                message: "BAD_REQUEST",
                longMessage: "Missing files or uploaderId",
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
                files: UploadFileResponse[];
                uploaderId: string;
            }>
        >(env.SOCKET_SERVER_URL + "/api/images/compress", {
            method: "POST",
            body: form,
        });

        if (res.message !== "OK") return CResponse(res);
        if (!res.data) return CResponse(res);
        if (!res.data.files?.length) return CResponse(res);

        return CResponse({
            message: "OK",
            data: { files: res.data.files, type: "image" },
        });
    } catch (err) {
        return handleError(err);
    }
}
