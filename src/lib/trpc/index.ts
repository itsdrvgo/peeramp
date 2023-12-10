import { ampRouter } from "./routers/amp";
import { uploadsRouter } from "./routers/uploads";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    user: userRouter,
    amp: ampRouter,
    uploads: uploadsRouter,
});

export type AppRouter = typeof appRouter;
