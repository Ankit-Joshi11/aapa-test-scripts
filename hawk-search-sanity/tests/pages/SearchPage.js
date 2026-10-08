// tests/pages/SearchPage.js
// ─────────────────────────────────────────────────────────────────────────────
// SearchPage – handles Hawk Search keyword searches and result validations.
//
// Responsibilities:
//  • Execute a keyword search via search input or direct search URL
//  • Verify that search results page is not blank
//  • Verify that search results contain product items
//  • Verify that the searched keyword is reflected on the page/URL
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { BASE_URL, ELEMENT_TIMEOUT } = require('../config/testConfig');
const { nameAppearsOnPage } = require('../helpers/navigationHelper');

class SearchPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.searchInput = page.locator(
      '#desktop-search-form-search-box, input[name="ac_q"], input[name="q"], input[placeholder*="Search" i], input[type="search"], input[aria-label*="Search" i], #search-box'
    ).first();

    this.productItemsLocator = page.locator(
      '[class*="product"], [class*="item"], [class*="card"], ' +
      '[class*="result"], [class*="hawk"], #search-results-page a[href*="/"]'
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Performs keyword search by clicking on the search input field,
   * typing the keyword, and pressing Enter.
   *
   * @param {string} [keyword='Cleaner'] - Term to search for
   */
  async search(keyword = 'Cleaner') {
    await this.searchInput.waitFor({ state: 'visible', timeout: ELEMENT_TIMEOUT });
    await this.searchInput.click();
    await this.searchInput.fill(keyword);
    await this.searchInput.press('Enter');
    await this.waitForReady();
    await this.waitForSpaContent();
    console.log(`  ✔ Clicked search input, entered "${keyword}" & pressed Enter → ${this.getCurrentUrl()}`);
  }

  /**
   * Alias method for search input interaction.
   *
   * @param {string} [keyword='Cleaner']
   */
  async searchByInput(keyword = 'Cleaner') {
    await this.search(keyword);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  /**
   * Asserts that the searched keyword is reflected in the URL or page body text.
   *
   * @param {string} keyword
   */
  async assertKeywordReflected(keyword) {
    const bodyText = await this.getBodyText();
    const url = decodeURIComponent(this.getCurrentUrl()).toLowerCase();
    const keywordLower = keyword.toLowerCase();

    const inUrl = url.includes(keywordLower);
    const inBody = nameAppearsOnPage(keyword, bodyText);

    expect(
      inUrl || inBody,
      `Search query "${keyword}" should be present in page URL or body text`
    ).toBe(true);

    console.log(`  ✔ Keyword "${keyword}" is reflected on the results page`);
  }

  /**
   * Asserts that at least `minCount` products are listed in the search results.
   *
   * @param {string} keyword
   * @param {number} [minCount=1]
   */
  async assertProductsVisible(keyword, minCount = 1) {
    try {
      await this.productItemsLocator.first().waitFor({ state: 'visible', timeout: 6000 });
    } catch (_e) {
      // Continue to evaluate count below
    }
    const count = await this.productItemsLocator.count();
    console.log(`  ✔ Product count for "${keyword}": ${count}`);
    expect(
      count,
      `Keyword search for "${keyword}" should return at least ${minCount} product`
    ).toBeGreaterThanOrEqual(minCount);
  }
}

module.exports = { SearchPage };
