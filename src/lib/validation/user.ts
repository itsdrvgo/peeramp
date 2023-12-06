import { z } from "zod";
import { nameSchema } from "./auth";

export const userTypesSchema = z.union([
    z.literal("normal"),
    z.literal("mentor"),
]);

export const userGenderSchema = z.union([
    z.literal("none"),
    z.literal("male"),
    z.literal("female"),
    z.literal("other"),
]);

export const userCategoriesSchema = z.union([
    z.literal("none"),
    z.literal("frontend"),
    z.literal("backend"),
    z.literal("fullstack"),
    z.literal("devops"),
    z.literal("designer"),
    z.literal("data"),
    z.literal("product"),
    z.literal("game"),
]);

export const userSocialTypesSchema = z.union([
    z.literal("youtube"),
    z.literal("instagram"),
    z.literal("x"),
    z.literal("github"),
    z.literal("facebook"),
    z.literal("linkedin"),
    z.literal("tiktok"),
    z.literal("twitch"),
    z.literal("spotify"),
    z.literal("discord"),
    z.literal("website"),
    z.literal("other"),
]);

export const userSocialSchema = z
    .object({
        id: z.string().optional(),
        name: z
            .string()
            .min(1, "Name must be at least 1 character")
            .max(100, "Name must be less than 100 characters"),
        url: z.string().min(1, "URL must be at least 1 character"),
        type: userSocialTypesSchema,
    })
    .refine(
        (data) => {
            if (!data.url.match(/^(https?:\/\/)?[^\s\/$.?#].[^\s]*$/))
                return false;

            if (
                !data.url.startsWith("http://") &&
                !data.url.startsWith("https://")
            )
                data.url = "https://" + data.url;

            const url = new URL(data.url);

            if (data.type === "other") return true;
            else if (data.type === "website") return true;
            else
                return (
                    (data.type === "youtube" &&
                        url.hostname === "youtube.com") ||
                    (data.type === "instagram" &&
                        url.hostname === "instagram.com") ||
                    (data.type === "x" && url.hostname === "x.com") ||
                    (data.type === "github" && url.hostname === "github.com") ||
                    (data.type === "facebook" &&
                        url.hostname === "facebook.com") ||
                    (data.type === "linkedin" &&
                        url.hostname === "linkedin.com") ||
                    (data.type === "tiktok" && url.hostname === "tiktok.com") ||
                    (data.type === "twitch" && url.hostname === "twitch.tv") ||
                    (data.type === "spotify" &&
                        url.hostname === "spotify.com") ||
                    (data.type === "discord" && url.hostname === "discord.com")
                );
        },
        {
            message: "Invalid URL for type",
            path: ["url"],
        }
    );

export const cachedUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    email: z.string().email(),
    image: z.string(),
    bio: z.string().nullable(),
    type: userTypesSchema,
    category: userCategoriesSchema,
    gender: userGenderSchema,
    socials: z.array(userSocialSchema),
    peersCount: z.number(),
    followingCount: z.number(),
    ampCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    usernameChangedAt: z.string(),
});

export const userEditSchema = z.object({
    firstName: nameSchema.shape.firstName,
    lastName: nameSchema.shape.lastName,
    bio: z.string().max(150, "Bio must be less than 150 characters"),
    category: userCategoriesSchema,
    gender: userGenderSchema,
});

export const clerkUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    username: z.string(),
    emailAddresses: z.array(
        z.object({
            id: z.string(),
            emailAddress: z.string().email(),
        })
    ),
    imageUrl: z.string().url(),
    lastSignInAt: z.number().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
});

export const publicMetadataSchema = z.object({
    gender: userGenderSchema,
    bio: z.string().nullable(),
    category: userCategoriesSchema,
    type: userTypesSchema,
    socials: z.array(userSocialSchema),
    usernameChangedAt: z.number(),
    ampCount: z.number(),
    followingCount: z.number(),
    peersCount: z.number(),
});

export const clerkUserWithoutEmailSchema = clerkUserSchema.omit({
    emailAddresses: true,
});
export const cachedUserWithoutEmailSchema = cachedUserSchema.omit({
    email: true,
});

export type ClerkUser = z.infer<typeof clerkUserSchema>;
export type ClerkUserWithoutEmail = z.infer<typeof clerkUserWithoutEmailSchema>;

export type CachedUser = z.infer<typeof cachedUserSchema>;
export type CachedUserWithoutEmail = z.infer<
    typeof cachedUserWithoutEmailSchema
>;

export type UserType = z.infer<typeof userTypesSchema>;
export type UserCategoryType = z.infer<typeof userCategoriesSchema>;
export type UserGenderType = z.infer<typeof userGenderSchema>;
export type UserSocialType = z.infer<typeof userSocialTypesSchema>;
export type UserSocial = z.infer<typeof userSocialSchema>;
export type PublicMetadata = z.infer<typeof publicMetadataSchema>;
export type UserEditData = z.infer<typeof userEditSchema>;
