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

function unique(values) {
    return [...new Set(values.filter(Boolean))];
}

export async function findAvailableDocumentPath(path) {
    if (!path || !path.trim()) {
        return "";
    }

    const trimmedPath = path.trim();
    const normalizedPath = trimmedPath.replace(/^\.\//, "");
    const noLeadingSlash = normalizedPath.replace(/^\//, "");

    const candidates = unique([
        trimmedPath,
        "./" + noLeadingSlash,
        "../" + noLeadingSlash,
        "/" + noLeadingSlash
    ]);

    for (const candidate of candidates) {
        // eslint-disable-next-line no-await-in-loop
        const available = await isDocumentAvailable(candidate);
        if (available) {
            return candidate;
        }
    }

    return "";
}
