import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export const customFileRouter = {};

export type CustomFileRouter = typeof customFileRouter;
