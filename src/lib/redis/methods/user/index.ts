export function generateCachedUserKey(id: string) {
    return `user:${id}`;
}

export function generateCachedUsernamesKey() {
    return "usernames";
}
