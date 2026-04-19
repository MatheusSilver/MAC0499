export async function isDocumentAvailable(path) {
    if (!path || !path.trim()) {
        return false;
    }

    if (window.location.protocol === "file:") {
        return true;
    }

    try {
        const headResponse = await fetch(path, { method: "HEAD" });
        if (headResponse.ok) {
            return true;
        }
    } catch {
        // Ignore and retry with GET.
    }

    try {
        const getResponse = await fetch(path, { method: "GET" });
        return getResponse.ok;
    } catch {
        return false;
    }
}
