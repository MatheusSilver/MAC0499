import { githubRepo, documents, schedule } from "./data.js";
import { fetchLatestCommitDate } from "./services/githubService.js";
import { initDocumentButtons } from "./utils/documentsUtils.js";
import { renderTimeline } from "./utils/timelineUtils.js";
import { renderPageLastUpdate } from "./utils/pageUtils.js";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
});

function getElements() {
    return {
        buttons: document.querySelectorAll("[data-doc]"),
        docView: document.getElementById("doc-view"),
        pageLastUpdate: document.getElementById("page-last-update"),
        taskTableBody: document.getElementById("task-table-body"),
        taskTableHeadRow: document.getElementById("task-table-head-row"),
        currentTimeMarker: document.getElementById("current-time-marker"),
        taskMonthNote: document.getElementById("task-month-note"),
        taskTableContent: document.querySelector(".task-table-content")
    };
}

async function getDocumentUpdateText(title, repoPath) {
    try {
        const commitDate = await fetchLatestCommitDate(githubRepo, repoPath);
        return "Última atualização de " + title + ": " + dateTimeFormatter.format(commitDate);
    } catch {
        return "Última atualização de " + title + ": não foi possível consultar no GitHub.";
    }
}

async function getPageUpdateText() {
    try {
        const commitDate = await fetchLatestCommitDate(githubRepo, "site/");
        return "Última atualização da página: " + dateTimeFormatter.format(commitDate);
    } catch {
        return "Última atualização da página: não foi possível consultar no GitHub.";
    }
}

function initApp() {
    const elements = getElements();

    initDocumentButtons(documents, elements, getDocumentUpdateText);
    renderTimeline(schedule, elements);
    renderPageLastUpdate(elements.pageLastUpdate, getPageUpdateText);

    window.addEventListener("resize", () => {
        renderTimeline(schedule, elements);
    });
}

initApp();
