const { test } = require('@playwright/test');
const { EnvironmentValidationPage } = require('../scripts/Validate-Prod-ASG-Refresh');

const PRODUCTION_URLS = [
    'https://abcauto.com/',
    'https://shop.eapw.com/',
    'https://shopbumpertobumper.com/',
    'https://autovaluestores.com/',
    'https://arnoldmotorsupply.com/',
    'https://myautovaluestore.com/',
    'https://www.monumentcarparts.com/',
    'https://store.autovalueparts.ca/',
    'https://shopmaslack.com/',
    'https://baxterautoparts.com/',
    'https://b2bkansas.com/',
    'https://shop.pistonringservice.com/',
    'https://staging.centropiezasplus.com/'
];

test.describe('Production Sites Working Verification', () => {

    for (const url of PRODUCTION_URLS) {
        test(`Verify ${url} is pointing to Production Data Data/Structure`, async ({ page }) => {
            const validationPage = new EnvironmentValidationPage(page);

            // Navigate to the production URL
            await validationPage.navigate(url);

            // Wait a moment for dynamic API calls/elements to load
            await page.waitForTimeout(3000);

            // Assert that the page is strictly Production (No UAT data/APIs)
            await validationPage.verifyProductionEnvironment(url);
        });
    }



});
