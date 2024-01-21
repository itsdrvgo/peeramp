import Player from "@/src/components/ui/player";

const VIDEO_KEY = "e0dc6345-d127-4da3-9cd9-f10d05657605-sa5sql";

function TestPage() {
    return (
        <section className="flex h-screen items-center justify-center">
            <div className="w-full max-w-lg">
                <Player
                    source={{
                        type: "uploadthing",
                        fileKey: VIDEO_KEY,
                    }}
                />
            </div>
        </section>
    );
}

export default TestPage;
