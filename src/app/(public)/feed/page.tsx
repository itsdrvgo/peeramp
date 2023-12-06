import FeedFetch from "@/src/components/feed/feed-fetch";
import { Suspense } from "react";

function Page() {
    return (
        <section className="flex w-full justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <FeedFetch />
            </Suspense>
        </section>
    );
}

export default Page;
