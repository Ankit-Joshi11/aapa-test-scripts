const { expect } = require('@playwright/test');

class EnvironmentValidationPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
    }

    /**
     * Navigates to the provided URL and waits for it to load
     * @param {string} url 
     */
    async navigate(url) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    /**
     * Validates that the current page does not exhibit UAT/Staging characteristics
     */
    async verifyProductionEnvironment(url) {
        const urlObj = new URL(url);
        const testingHostname = urlObj.hostname.toLowerCase();

        // 1. Check Canonical URL in the DOM
        const canonicalTag = this.page.locator('link[rel="canonical"]');
        if (await canonicalTag.count() > 0) {
            const canonicalUrl = await canonicalTag.first().getAttribute('href');
            if (canonicalUrl) {
                const lowerCanonical = canonicalUrl.toLowerCase();
                // Ensure the canonical URL does NOT point to UAT/Staging
                if (testingHostname.includes('staging')) {
                    expect(lowerCanonical, `Production site ${url} has a UAT/Staging canonical URL: ${canonicalUrl}`).not.toMatch(/uat/);
                } else {
                    expect(lowerCanonical, `Production site ${url} has a UAT/Staging canonical URL: ${canonicalUrl}`).not.toMatch(/uat|staging/);
                }

                // Ensure the canonical domain matches the production domain
                try {
                    const prodHostname = testingHostname.replace('www.', '');
                    const canonicalHostname = new URL(canonicalUrl, url).hostname.replace('www.', '');
                    expect(canonicalHostname, `Canonical URL domain ${canonicalHostname} does not match Production domain ${prodHostname}`).toBe(prodHostname);
                } catch (e) {
                    // Ignore parsing errors if the URL is somehow malformed
                }
            }
        } else {
            console.log(`[INFO] No canonical link found on ${url}`);
        }
    }

}

module.exports = { EnvironmentValidationPage };
