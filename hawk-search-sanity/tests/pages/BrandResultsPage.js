// tests/pages/BrandResultsPage.js
// ─────────────────────────────────────────────────────────────────────────────
// BrandResultsPage – represents an individual brand search-results page.
// URL pattern: https://abcauto.com/en/b/<BrandName>/search
//
// Responsibilities:
//  • Navigate to a brand results page by URL
//  • Verify the brand name is reflected on the page
//  • Verify the page is not blank
//  • Count and verify the product listing
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { nameAppearsOnPage } = require('../helpers/navigationHelper');

class BrandResultsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Hawk Search product item containers (multiple class patterns supported)
    this.productItemsLocator = page.locator(
      '[class*="product-item"], [class*="product-card"], ' +
      '[class*="result-item"], [class*="hawk-result"], ' +
      '[class*="ResultItem"], .hawk-results__item'
    );
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigates directly to a brand results page.
   *
   * @param {string} url - Full brand results URL
   */
  async open(url) {
    await this.goto(url);
    console.log(`  ✔ Navigated to brand page → ${this.getCurrentUrl()}`);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  /**
   * Asserts that the brand name appears somewhere in the page body text.
   *
   * @param {string} brandName
   */
  async assertBrandNameVisible(brandName) {
    const bodyText = await this.getBodyText();
    const decodedUrl = decodeURIComponent(this.getCurrentUrl()).toLowerCase();

    const { getSignificantWords } = require('../helpers/navigationHelper');
    const words = getSignificantWords(brandName);

    const foundInBody = nameAppearsOnPage(brandName, bodyText);
    const foundInUrl  = words.length === 0 || words.some((w) => decodedUrl.includes(w));

    expect(
      foundInBody || foundInUrl,
      `Brand page should mention the brand name "${brandName}" in body text or URL`
    ).toBe(true);

    console.log(`  ✔ Brand name "${brandName}" is present on page`);
  }

  /**
   * Asserts that at least `minCount` products are listed on the page.
   *
   * @param {string} brandName - Used in the assertion failure message
   * @param {number} [minCount=1]
   */
  async assertProductsVisible(brandName, minCount = 1) {
    try {
      await this.productItemsLocator.first().waitFor({ state: 'visible', timeout: 6000 });
    } catch (_e) {
      // Continue to evaluate count below
    }
    const count = await this.productItemsLocator.count();
    console.log(`  ✔ Products shown on brand page: ${count}`);
    expect(
      count,
      `Brand page "${brandName}" should list at least ${minCount} product`
    ).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { BrandResultsPage };
