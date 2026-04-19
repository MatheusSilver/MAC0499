export async function fetchLatestCommitDate(githubRepo, repoPath) {
    const endpoint = "https://api.github.com/repos/" + githubRepo + "/commits?path=" + encodeURIComponent(repoPath) + "&per_page=1";
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error("GitHub request failed");
    }

    const commits = await response.json();
    const date = commits?.[0]?.commit?.author?.date;

    if (!date) {
        throw new Error("Commit date not found");
    }

    return new Date(date);
}
