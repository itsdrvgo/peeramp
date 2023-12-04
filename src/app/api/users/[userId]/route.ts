import { CResponse, handleError } from "@/src/lib/utils";
import {
    userCategoriesSchema,
    userGenderSchema,
    userSocialSchema,
    userTypesSchema,
} from "@/src/lib/validation/user";
import { clerkClient, currentUser } from "@clerk/nextjs";
import { NextRequest } from "next/server";
import { z } from "zod";

const userContextSchema = z.object({
    params: z.object({
        userId: z.string(),
    }),
});

const publicMetadataSchema = z.object({
    gender: userGenderSchema,
    bio: z.string(),
    category: userCategoriesSchema,
    type: userTypesSchema,
    socials: z.array(userSocialSchema),
    usernameChangedAt: z.number(),
    ampCount: z.number(),
    followingCount: z.number(),
    peersCount: z.number(),
});

type UserContext = z.infer<typeof userContextSchema>;

export async function PATCH(req: NextRequest, context: UserContext) {
    try {
        const body = await req.formData();

        const { params } = userContextSchema.parse(context);

        const user = await currentUser();
        if (!user) return CResponse({ message: "UNAUTHORIZED" });
        if (user.id !== params.userId)
            return CResponse({ message: "FORBIDDEN" });

        const image = body.get("image");
        if (!image) return CResponse({ message: "BAD_REQUEST" });

        await clerkClient.users.updateUserProfileImage(params.userId, {
            file: image as File,
        });

        return CResponse({ message: "OK" });
    } catch (err) {
        return handleError(err);
    }
}

export async function PUT(req: NextRequest, context: UserContext) {
    try {
        const body = await req.json();

        const { params } = userContextSchema.parse(context);
        const publicMetadata = publicMetadataSchema.parse(body);

        const user = await currentUser();
        if (!user) return CResponse({ message: "UNAUTHORIZED" });

        if (user.id !== params.userId)
            return CResponse({ message: "FORBIDDEN" });

        await clerkClient.users.updateUserMetadata(params.userId, {
            publicMetadata,
        });

        return CResponse({ message: "OK" });
    } catch (err) {
        return handleError(err);
    }
}
