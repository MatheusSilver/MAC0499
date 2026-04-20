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
    const pageShell = document.querySelector(".page-shell");

    initDocumentButtons(documents, elements, getDocumentUpdateText);
    renderTimeline(schedule, elements);
    renderPageLastUpdate(elements.pageLastUpdate, getPageUpdateText);

    const revealPage = () => {
        if (!pageShell) {
            return;
        }

        pageShell.style.transition = "opacity 420ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
        pageShell.style.opacity = "1";
        pageShell.style.transform = "translateY(0)";
    };

    if (document.readyState === "complete") {
        requestAnimationFrame(revealPage);
    } else {
        window.addEventListener("load", () => {
            requestAnimationFrame(revealPage);
        }, { once: true });
    }

    window.addEventListener("resize", () => {
        renderTimeline(schedule, elements);
    });
}

initApp();
