import {
    auth as clerkAuth,
    SignedInAuthObject,
    SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { db } from "../drizzle";
import { amps, comments, userDetails, users } from "../drizzle/schema";

type CreateContextOptions = {
    auth: SignedInAuthObject | SignedOutAuthObject | null;
};

export const createContextInner = async ({ auth }: CreateContextOptions) => {
    return {
        auth,
        db,
        amps,
        users,
        userDetails,
        comments,
    };
};

export const createContext = async () => {
    const auth = clerkAuth();

    return await createContextInner({
        auth,
    });
};

export type Context = Awaited<ReturnType<typeof createContext>>;
