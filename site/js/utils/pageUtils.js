export async function renderPageLastUpdate(pageElement, getLastUpdateText) {
    if (!pageElement) {
        return;
    }

    pageElement.textContent = "Última atualização da página: consultando...";
    pageElement.textContent = await getLastUpdateText("página", "site/index.html");
}
