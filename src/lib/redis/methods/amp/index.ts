export function generateCachedAmpAnalyticsKey(ampId: string) {
    return `amp:${ampId}:analytics`;
}

export function generateCachedAmpRetentionKey(ampId: string) {
    return `amp:${ampId}:retention`;
}

export function generateAmpLikesKey(ampId: string) {
    return `amp:${ampId}:likes`;
}

export function generateAmpCommentsKey(ampId: string) {
    return `amp:${ampId}:comments`;
}

export function generateAmpBookmarksKey(ampId: string) {
    return `amp:${ampId}:bookmarks`;
}
