import { isDocumentAvailable } from "../services/documentService.js";

export function initDocumentButtons(documents, elements, getLastUpdateText) {
    const { buttons, docView } = elements;
    if (!buttons?.length || !docView) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener("click", async () => {
            buttons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            const documentKey = button.dataset.doc;
            const documentData = documents[documentKey];
            const documentPath = documentData?.path;

            const available = await isDocumentAvailable(documentPath);
            if (!available) {
                docView.innerHTML = '<p class="doc-status">Este documento ainda não foi publicado.</p>';
                return;
            }

            docView.innerHTML = '<iframe class="doc-frame" src="' + documentPath + '#toolbar=1" title="Documento em PDF"></iframe><p class="doc-meta">Consultando última atualização...</p>';

            const updateText = await getLastUpdateText(documentData.title, documentData.repoPath);
            const metaElement = docView.querySelector(".doc-meta");
            if (metaElement) {
                metaElement.textContent = updateText;
            }
        });
    });
}
