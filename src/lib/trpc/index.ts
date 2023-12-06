import { ampRouter } from "./routers/amp";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    user: userRouter,
    amp: ampRouter,
});

export type AppRouter = typeof appRouter;
