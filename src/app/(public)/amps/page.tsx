import AmpFetch from "@/src/components/amps/amp-fetch";
import NoAmpPage from "@/src/components/global/404/no-amp-page";
import { Suspense } from "react";

// http://localhost:3000/amps?uId=user_2YiHP3UwN9c2bE8cpwQ0G71sA36&aId=uA1ySdDWg2VPRoalhJ0-4
// http://localhost:3000/amps?uId=user_2YiHP3UwN9c2bE8cpwQ0G71sA36&aId=FCiSYqVYAPcbJ_O0mewKr
// http://localhost:3000/amps?uId=user_2YiHP3UwN9c2bE8cpwQ0G71sA36&aId=B8Ixmm8wI6c7YWrW7ug8H

interface PageProps {
    searchParams: {
        uId: string;
        aId: string;
    };
}

function Page({ searchParams }: PageProps) {
    if (!searchParams || !searchParams?.uId || !searchParams?.aId)
        return (
            <section className="flex w-full justify-center">
                <NoAmpPage />
            </section>
        );

    return (
        <section className="flex w-full justify-center">
            <Suspense
                fallback={
                    <div>
                        <p>Loading...</p>
                    </div>
                }
            >
                <AmpFetch searchParams={searchParams} />
            </Suspense>
        </section>
    );
}

export default Page;
