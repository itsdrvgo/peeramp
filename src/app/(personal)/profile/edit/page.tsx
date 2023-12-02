import ProfileEditFetch from "@/src/components/profile/edit/profile-edit-fetch";
import { siteConfig } from "@/src/config/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Edit Profile | " + siteConfig.name,
    description: "Edit your profile",
};

function Page() {
    return (
        <section className="flex w-full justify-center">
            <ProfileEditFetch />
        </section>
    );
}

export default Page;
