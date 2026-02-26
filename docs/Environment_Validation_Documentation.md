# Production vs. UAT Environment Validation Suite

## 1. Description and Purpose of the Script
When deploying multiple e-commerce or informational storefronts across various domains, there is a risk that a Production URL might inadvertently connect to a User Acceptance Testing (UAT) or Staging environment. When this happens, real-world users might interact with fake data, test products, or unfinished features.

The purpose of this automation suite is to programmatically verify that an array of defined Production URLs are authentically pointing to Production data and structures, and are entirely detached from UAT or Staging dependencies. Conversely, it ensures that designated Staging environments genuinely exhibit test-level characteristics. 

The suite comprises two main components:
*   `scripts/EnvironmentValidationPage.js` - A Page Object Model (POM) class containing the core logic and Playwright assertions to identify environment types.
*   `tests/Validate-Prod-ASG-Refresh.spec.js` - The executable Playwright test script that iterates through the provided URLs and coordinates the assertions.

---

## 2. How Are We Validating and What Are We Checking?
The `EnvironmentValidationPage` class relies on Canonical URL Consistency to conclusively determine an environment's state during runtime.

### A. Canonical URL Consistency
Search Engine Optimization (SEO) depends heavily on Canonical tags (`<link rel="canonical" href="...">`) to tell external crawlers the "true" address of a page.
**Verification:** The script locates the canonical tag on the page and verifies two strict conditions:
1.  **Domain Exact Match:** The hostname parsed from the canonical URL must strictly match the hostname of the Production URL being tested. If `abcauto.com` has a canonical tag pointing to `def-auto.com`, the assertion fails.

---

## 3. How We Resolved This Using Automation
To deploy this verification cleanly and efficiently, we utilized Playwright alongside the Page Object Model (POM) architectural pattern.

1.  **Data-Driven Arrays:** Inside `Validate-Prod-ASG-Refresh.spec.js`, targeted URLs are placed into the `PRODUCTION_URLS` array. Instead of writing separate tests, the script dynamically loops over these arrays (`for (const url of PRODUCTION_URLS)`), drastically cutting down code duplication and making maintenance as easy as appending a new string to the list.
2.  **Canonical Validation:** 
    *   `verifyProductionEnvironment(url)` executes strict canonical checking logic ensuring correct environment topology.
3.  **Cross-Browser Assertions:** By leveraging Playwright's native `expect()` module, failures automatically generate robust Trace and HTML reports, allowing QA engineers to see the exact Canonical tag that triggered the failure without having to manually inspect the live website.

### Running the Suite
To execute the environment verification suite against all configured domains:
```bash
cd Playwright
npx playwright test tests/Validate-Prod-ASG-Refresh.spec.js
```
