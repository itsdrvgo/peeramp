import { handleError } from "@/src/lib/utils";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userContextSchema = z.object({
    params: z.object({
        userId: z.string(),
    }),
});

type UserContext = z.infer<typeof userContextSchema>;

export async function PUT(req: NextRequest, context: UserContext) {
    try {
        const body = await req.formData();

        const { params } = userContextSchema.parse(context);

        const user = await currentUser();
        if (!user)
            return NextResponse.json({
                code: 401,
                message: "Unauthorized!",
            });

        if (user.id !== params.userId)
            return NextResponse.json({
                code: 403,
                message: "Unauthorized!",
            });

        const image = body.get("image");
        if (!image)
            return NextResponse.json({
                code: 400,
                message: "Bad Request!",
            });

        await clerkClient.users.updateUserProfileImage(params.userId, {
            file: image as File,
        });

        return NextResponse.json({
            code: 200,
            message: "Ok",
        });
    } catch (err) {
        return handleError(err);
    }
}
