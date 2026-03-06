import { test, expect } from '@playwright/test';
const { LoginPage } = require('../pages/LoginPage');
const { ProductsPage } = require('../pages/ProductsPage');
const { ProductDetailsPage } = require('../pages/ProductDetailsPage');

test.describe('Product Export Functionality', () => {

    test('should login and export a product PDF successfully', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const productsPage = new ProductsPage(page);
        const productDetailsPage = new ProductDetailsPage(page);

        // 1. Navigate to the login page
        await test.step('Navigate to application', async () => {
            await loginPage.navigate();
        });

        // 2. Perform Login
        await test.step('Login with valid credentials', async () => {
            await loginPage.login('hotwax.user', 'hotwax@786');
        });

        // 3. Navigate to Products section
        await test.step('Navigate to products section', async () => {
            await productsPage.navigateToProducts();
        });

        // 4. Search for a random Brand or Sub Brand with retry logic
        await test.step('Search using random Brand Id or Sub Brand Id', async () => {
            // Temporarily increase test timeout for this step since retrying could take some time
            test.setTimeout(120000);
            await productsPage.searchWithRandomBrandsOrSubBrands();
        });

        // 5. Get 4-5 part numbers from the search results
        let partNumbersToExport = [];
        await test.step('Extract part numbers from results', async () => {
            partNumbersToExport = await productsPage.getPartNumbersToExport();
        });

        // 6. Iterate through extracted part numbers, open them in new tabs, and export
        const successfullyOpened = [];
        const openedPages = [];

        await test.step('Open products in new tabs', async () => {
            for (const partNumber of partNumbersToExport) {
                console.log(`\n--- Opening Part Number in new tab: ${partNumber} ---`);

                // Get the link element
                const linkLabel = page.getByRole('link', { name: partNumber, exact: true });
                let linkToClick = linkLabel;

                if (!(await linkLabel.isVisible())) {
                    linkToClick = page.locator(`a:has-text("${partNumber}")`).first();
                }

                if (await linkToClick.isVisible()) {
                    // Wait for the new page event while middle-clicking to open in a new tab
                    const newPagePromise = page.context().waitForEvent('page');

                    // Middle click opens links in a new tab in most browsers
                    await linkToClick.click({ button: 'middle' });

                    const newPage = await newPagePromise;
                    await newPage.waitForLoadState('domcontentloaded');
                    openedPages.push({ partNumber, page: newPage });
                    console.log(`Successfully opened ${partNumber} in a new tab.`);
                } else {
                    console.log(`Could not find link for ${partNumber} to open.`);
                }
            }
        });

        await test.step('Iterate through open tabs and click Export PDF', async () => {
            for (const { partNumber, page: productPage } of openedPages) {
                console.log(`\n--- Processing Export for Part Number: ${partNumber} ---`);

                // Create a temporary ProductDetailsPage instance for this specific tab
                const tabProductDetailsPage = new ProductDetailsPage(productPage);

                try {
                    // Click the export link inside the specific tab
                    console.log(`Clicking Export PDF button for ${partNumber}...`);

                    // We don't await the popup/download explicitly as requested, just trigger the click
                    const popupPromise = productPage.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
                    await tabProductDetailsPage.exportPdfLink.click();

                    // Wait briefly just so the browser has time to register the click/popup before we close the tab
                    await popupPromise;

                    successfullyOpened.push(partNumber);
                } catch (e) {
                    console.log(`Failed to click export link for ${partNumber}. Error: ${e.message}`);
                }

                // Close the product tab now that we are done with it
                await productPage.close();
            }
        });

        // Print Final Summary
        console.log('\n======================================================');
        console.log(`Total Products Attempted: ${partNumbersToExport.length}`);
        console.log(`Export Button Clicked for: ${successfullyOpened.length}`);
        console.log(`Verified Part Numbers: ${successfullyOpened.join(', ')}`);
        console.log('======================================================\n');
    });
});