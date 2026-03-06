class ProductDetailsPage {
    constructor(page) {
        this.page = page;
        this.exportPdfLink = page.getByRole('link', { name: 'Export PDF' });
    }

    async exportPDF() {
        const page1Promise = this.page.waitForEvent('popup');
        await this.exportPdfLink.click();
        const popupPage = await page1Promise;
        // Removed waitForLoadState() because PDF generation/viewers often delay or don't trigger the load event, causing timeouts.
        return popupPage;
    }
}

module.exports = { ProductDetailsPage };
