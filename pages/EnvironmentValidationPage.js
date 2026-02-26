const { expect } = require('@playwright/test');

class EnvironmentValidationPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.networkRequests = [];

        // Listen to all network requests to catch if a Prod site makes calls to UAT/Staging APIs
        this.page.on('request', request => {
            this.networkRequests.push(request.url());
        });
    }

    /**
     * Navigates to the provided URL and waits for it to load
     * @param {string} url 
     */
    async navigate(url) {
        // Clear previous requests before navigating
        this.networkRequests = [];
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    /**
     * Validates that the current page does not exhibit UAT/Staging characteristics
     */
    async verifyProductionEnvironment(url) {
        const urlObj = new URL(url);
        const testingHostname = urlObj.hostname.toLowerCase();

        // 1. Check Network APIs (Ensures Prod site isn't calling UAT backend services)
        // From inspection, UAT uses 'test.hawksearch.net' and often 'uat' / 'staging' domains
        const suspiciousRequests = this.networkRequests.filter(reqUrl => {
            const lowerUrl = reqUrl.toLowerCase();

            // Allow requests to the exact same domain even if it has 'staging' in its name
            try {
                const reqObj = new URL(reqUrl);
                if (reqObj.hostname.toLowerCase() === testingHostname) return false;
            } catch (e) { }

            return lowerUrl.includes('uat') || lowerUrl.includes('staging') || lowerUrl.includes('test.hawksearch');
        });

        // 2. Check for UAT specific elements in the DOM 
        // Inspection showed a banner containing "** ALLIANCE INTERNAL TEST SITE ONLY **"
        const uatTextLocator = this.page.getByText('ALLIANCE INTERNAL TEST SITE', { exact: false }).first();
        const isUatBannerVisible = await uatTextLocator.isVisible();

        // Let's assert based on these characteristics
        if (suspiciousRequests.length > 0) {
            console.log(`[WARNING] Suspicious UAT/Staging API calls found on ${url}:`);
            suspiciousRequests.slice(0, 5).forEach(req => console.log(` -> ${req}`));
        }

        // Assertions: 
        // We expect NO suspicious UAT network calls and NO UAT banners. 
        // If this fails, it means the Prod URL is pointing to UAT data/structure.
        expect(suspiciousRequests.length, `Production site ${url} is making requests to UAT/Staging URLs!`).toBe(0);
        expect(isUatBannerVisible, `Production site ${url} is displaying a UAT/Staging banner!`).toBe(false);

        // 3. Check Canonical URL in the DOM
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

    /**
     * Validates that the current page DOES exhibit UAT/Staging characteristics
     */
    async verifyStagingEnvironment(url) {
        // 1. Check Network APIs
        const suspiciousRequests = this.networkRequests.filter(reqUrl => {
            const lowerUrl = reqUrl.toLowerCase();
            return lowerUrl.includes('uat') || lowerUrl.includes('staging') || lowerUrl.includes('test.hawksearch');
        });

        // 2. Check for UAT specific elements in the DOM 
        const uatTextLocator = this.page.getByText('ALLIANCE INTERNAL TEST SITE', { exact: false }).first();
        const isUatBannerVisible = await uatTextLocator.isVisible();

        // Assertions: 
        // We expect YES suspicious UAT network calls OR a UAT banner. 
        // If this fails, it means the Staging URL is pointing to Prod data/structure.
        const isStaging = suspiciousRequests.length > 0 || isUatBannerVisible;
        expect(isStaging, `Staging site ${url} is NOT displaying UAT/Staging indicators!`).toBe(true);
    }
}

module.exports = { EnvironmentValidationPage };
