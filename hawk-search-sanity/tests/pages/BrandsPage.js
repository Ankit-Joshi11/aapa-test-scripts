// tests/pages/BrandsPage.js
// ─────────────────────────────────────────────────────────────────────────────
// BrandsPage – represents https://abcauto.com/ShopAllBrands
//
// Responsibilities:
//  • Collect the complete list of brand links
//  • Report the total brand count
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { BasePage } = require('./BasePage');
const { ELEMENT_TIMEOUT } = require('../config/testConfig');

class BrandsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Brand links on /ShopAllBrands
    this.brandLinksLocator = page.locator('a[href*="/en/b/"], a[href*="/b/"], [class*="brand"] a');
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Waits for at least one brand link to appear, then collects all brand
   * links on the page.
   *
   * @returns {Promise<{ name: string, href: string }[]>} Array of brand objects
   */
  async getAllBrands() {
    try {
      await this.brandLinksLocator.first().waitFor({ state: 'visible', timeout: 8000 });
    } catch (_e) {
      // Continue to evaluate
    }

    const brands = await this.brandLinksLocator.evaluateAll((elements) =>
      elements
        .map((el) => ({
          name: (el.textContent || '').trim(),
          href: el.href,
        }))
        .filter((b) => b.name.length > 0 && (b.href.includes('/b/') || b.href.includes('Brand')))
    );

    console.log(`  ✔ Total brands found: ${brands.length}`);
    return brands;
  }
}

module.exports = { BrandsPage };
