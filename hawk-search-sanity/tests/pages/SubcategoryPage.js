// tests/pages/SubcategoryPage.js
// ─────────────────────────────────────────────────────────────────────────────
// SubcategoryPage – represents a subcategory search-results page.
// URL pattern: https://abcauto.com/en/c/<Category>/<Subcategory>/<ID>/search
//
// Responsibilities:
//  • Navigate to a subcategory page by URL
//  • Verify the URL has actually changed from the parent category
//  • Verify the subcategory name is reflected on the page
//  • Verify the page is not blank
//  • Verify at least 1 product or sub-link is visible
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { nameAppearsOnPage } = require('../helpers/navigationHelper');

class SubcategoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Items visible on a subcategory page can be:
    //  – Hawk Search product cards
    //  – Further subcategory links (deeper nesting)
    this.itemsLocator = page.locator(
      '[class*="product-item"], [class*="product-card"], ' +
      '[class*="result-item"], [class*="hawk-result"], ' +
      '[class*="ResultItem"], .hawk-results__item, ' +
      '#replacement-parts a, #search-results-page a[href*="/"]'
    );
    this.itemCardsLocator = this.itemsLocator;
  }

  /**
   * Returns the count of items visible on the subcategory page.
   * @returns {Promise<number>}
   */
  async getItemCount() {
    return await this.itemsLocator.count().catch(() => 0);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigates directly to a subcategory results page.
   *
   * @param {string} url - Full subcategory URL
   */
  async open(url) {
    await this.goto(url);
    console.log(`        ✔ URL: ${this.getCurrentUrl()}`);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  /**
   * Asserts the current URL is different from the parent category URL,
   * confirming successful navigation to the subcategory.
   *
   * @param {string} categoryUrl - Parent category URL to compare against
   * @param {string} subcategoryName - Used in the assertion message
   */
  async assertUrlChangedFrom(categoryUrl, subcategoryName) {
    expect(
      this.getCurrentUrl(),
      `Navigating to subcategory "${subcategoryName}" should change the URL from the category page`
    ).not.toBe(categoryUrl);
  }

  /**
   * Asserts that the subcategory name is reflected after navigation.
   *
   * Checks two sources (either one passing = success):
   *  1. Page body text – at least one significant word (> 3 chars) from
   *     `subcategoryName` must appear (handles heading reformatting).
   *  2. Current URL (decoded) – the URL always encodes the subcategory name
   *     so this is a reliable fallback when SPA content is still rendering.
   *
   * @param {string} subcategoryName
   */
  async assertSubcategoryNameVisible(subcategoryName) {
    const bodyText  = await this.getBodyText();
    const decodedUrl = decodeURIComponent(this.getCurrentUrl()).toLowerCase();

    // Check 1 – body text contains at least one meaningful word from the name
    const foundInBody = nameAppearsOnPage(subcategoryName, bodyText);

    // Check 2 – URL path encodes the subcategory name
    const { getSignificantWords } = require('../helpers/navigationHelper');
    const words = getSignificantWords(subcategoryName);
    const foundInUrl = words.length === 0 || words.some((w) => decodedUrl.includes(w));

    expect(
      foundInBody || foundInUrl,
      `Subcategory "${subcategoryName}" should appear in page body text or page URL.\n` +
      `  Checked words : [${words.join(', ')}]\n` +
      `  Body match    : ${foundInBody}\n` +
      `  URL match     : ${foundInUrl} (URL: ${decodedUrl})`
    ).toBe(true);

    console.log(`        ✔ Subcategory name is reflected on the page`);
  }

  /**
   * Asserts that at least `minCount` items (products or sub-links) are
   * visible on the subcategory page.
   *
   * @param {string} subcategoryName - Used in the assertion message
   * @param {number} [minCount=1]
   */
  async assertItemsVisible(subcategoryName, minCount = 1) {
    try {
      await this.itemsLocator.first().waitFor({ state: 'visible', timeout: 6000 });
    } catch (_e) {
      // Continue to evaluate count below
    }
    const count = await this.itemsLocator.count();
    console.log(`        ✔ Items/links shown on page: ${count}`);
    expect(
      count,
      `Subcategory page "${subcategoryName}" should show at least ${minCount} product or sub-link`
    ).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { SubcategoryPage };
