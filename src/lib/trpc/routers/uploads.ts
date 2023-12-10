import { utapi } from "@/src/app/api/uploadthing/core";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const uploadsRouter = createTRPCRouter({
    getFile: publicProcedure
        .input(
            z.object({
                fileKey: z.string(),
            })
        )
        .query(async ({ input }) => {
            const { fileKey } = input;

            const file = await utapi.getFileUrls(fileKey).catch(() => null);
            if (!file) return { file: null };
            if (file.length === 0) return { file: null };

            return {
                file: file[0],
            };
        }),
});
