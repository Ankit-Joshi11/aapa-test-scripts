class ProductsPage {
    constructor(page) {
        this.page = page;
        this.productsLink = page.getByRole('link', { name: 'Products' }).first();
        this.searchButton = page.getByRole('button', { name: 'Search' });
    }

    async navigateToProducts() {
        await this.productsLink.click();
    }

    async searchWithRandomBrandsOrSubBrands() {
        const dropdownLabels = ['Brand Id', 'Sub Brand Id'];
        let resultsFound = false;

        const noResultsAlert = this.page.locator('div.alert.alert-info', { hasText: 'No results found' });
        let previousSelections = null;

        while (!resultsFound) {
            // Uncheck previous selections if the last search had no results
            if (previousSelections) {
                console.log(`Unchecking previously selected options from ${previousSelections.label}...`);
                const prevContainer = this.page.locator('div, tr').filter({
                    has: this.page.locator(`label:has-text("${previousSelections.label}")`)
                }).last();

                const prevDropdownButton = prevContainer.locator('button').first();
                await prevDropdownButton.click(); // Open previous dropdown
                await this.page.waitForTimeout(1000);

                const prevOptions = this.page.getByRole('combobox').getByRole('option');
                for (const index of previousSelections.indices) {
                    await prevOptions.nth(index).click(); // Click again to uncheck
                    await this.page.waitForTimeout(300);
                }

                await prevDropdownButton.click(); // Close previous dropdown
                await this.page.waitForTimeout(500);
                previousSelections = null; // Clear so it's not unchecked again
            }

            const randomLabel = dropdownLabels[Math.floor(Math.random() * dropdownLabels.length)];
            console.log(`\n--- Attempting search with: ${randomLabel} ---`);

            // Find the dropdown button associated with the label
            const container = this.page.locator('div, tr').filter({
                has: this.page.locator(`label:has-text("${randomLabel}")`)
            }).last();

            const dropdownButton = container.locator('button').first();

            // Open the dropdown
            await dropdownButton.click();
            await this.page.waitForTimeout(1000);

            // Count options available
            const options = this.page.getByRole('combobox').getByRole('option');
            const optionsCount = await options.count();
            console.log(`Total options available for ${randomLabel}: ${optionsCount}`);

            if (optionsCount === 0) {
                console.log(`No options found for ${randomLabel}. Retrying...`);
                await dropdownButton.click(); // Close dropdown
                continue;
            }

            // Randomly select between 1 and 4 options
            const maxToSelect = Math.min(4, optionsCount);
            const numToSelect = Math.floor(Math.random() * maxToSelect) + 1;
            console.log(`Selecting ${numToSelect} random option(s)...`);

            const selectedIndices = new Set();
            while (selectedIndices.size < numToSelect) {
                selectedIndices.add(Math.floor(Math.random() * optionsCount));
            }

            const selectedNames = [];
            for (const index of selectedIndices) {
                const opt = options.nth(index);
                const text = await opt.innerText();
                selectedNames.push(text.trim());
                await opt.click();
                await this.page.waitForTimeout(300);
            }

            // Save the selections in case we need to uncheck them on the next loop
            previousSelections = { label: randomLabel, indices: selectedIndices, names: selectedNames };

            // Close the dropdown
            await dropdownButton.click();
            await this.page.waitForTimeout(500);

            // Click Search
            await this.searchButton.click();

            // Wait for search to complete
            try {
                await this.page.waitForLoadState('networkidle', { timeout: 3000 });
            } catch (e) {
                // Ignore timeout, we have a fallback wait
            }
            await this.page.waitForTimeout(2000);

            if (await noResultsAlert.isVisible()) {
                console.log('Message appeared: "No results found". Retrying with different options...');
            } else {
                console.log(`Search yielded results for ${randomLabel}: ${previousSelections.names.join(', ')}`);
                resultsFound = true;
                // Since results are found, we don't need to uncheck next iteration (loop ends anyway)
            }
        }
    }

    async getPartNumbersToExport() {
        // Find links in the results table that are likely product IDs
        const productLinks = this.page.locator('table tbody tr td a');
        const count = await productLinks.count();

        let partNumbers = [];
        const maxToExport = Math.min(5, count);

        if (count > 0) {
            console.log(`Found ${count} products in results. Selecting ${maxToExport} to export...`);
            for (let i = 0; i < maxToExport; i++) {
                const text = await productLinks.nth(i).innerText();
                partNumbers.push(text.trim());
            }
        } else {
            // Fallback: look for a link whose text is just digits (typical of Product IDs)
            console.log('Could not find product links in standard table, attempting fallback...');
            const fallbackLinks = this.page.locator('a').filter({ hasText: /^\d+$/ });
            const fallbackCount = await fallbackLinks.count();
            const fallbackMax = Math.min(5, fallbackCount);

            if (fallbackCount > 0) {
                console.log(`Found ${fallbackCount} product links (fallback). Selecting ${fallbackMax}...`);
                for (let i = 0; i < fallbackMax; i++) {
                    const text = await fallbackLinks.nth(i).innerText();
                    partNumbers.push(text.trim());
                }
            } else {
                // Default fallback
                const defaultLinks = this.page.locator('div[class*="results"] a, .table-responsive a');
                const defaultCount = await defaultLinks.count();
                const defaultMax = Math.min(5, defaultCount);
                if (defaultCount > 0) {
                    for (let i = 0; i < defaultMax; i++) {
                        const text = await defaultLinks.nth(i).innerText();
                        partNumbers.push(text.trim());
                    }
                }
            }
        }

        return partNumbers;
    }

    async openProductByName(partNumber) {
        // Try exact match first
        const link = this.page.getByRole('link', { name: partNumber, exact: true });
        if (await link.isVisible()) {
            await link.click();
        } else {
            // Fallback to partial match if exact fails
            await this.page.locator(`a:has-text("${partNumber}")`).first().click();
        }
    }
}

module.exports = { ProductsPage };
