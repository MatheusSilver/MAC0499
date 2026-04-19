export async function isDocumentAvailable(path) {
    if (!path || !path.trim()) {
        return false;
    }

    if (window.location.protocol === "file:") {
        return true;
    }

    try {
        const getResponse = await fetch(path, { method: "GET" });
        return getResponse.ok;
    } catch {
        return false;
    }
}
