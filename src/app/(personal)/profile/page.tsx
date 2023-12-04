import ProfileFetch from "@/src/components/profile/profile-fetch";
import ProfileInfoSkeleton from "@/src/components/profile/skeletons/profile-info-skeleton";
import { Suspense } from "react";

function Page() {
    return (
        <section className="flex w-full flex-col items-center">
            <Suspense fallback={<ProfileInfoSkeleton />}>
                <ProfileFetch />
            </Suspense>
        </section>
    );
}

export default Page;
