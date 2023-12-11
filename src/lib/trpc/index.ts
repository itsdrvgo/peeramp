import { ampRouter } from "./routers/amp";
import { linkRouter } from "./routers/link";
import { uploadsRouter } from "./routers/uploads";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    user: userRouter,
    amp: ampRouter,
    uploads: uploadsRouter,
    link: linkRouter,
});

export type AppRouter = typeof appRouter;
