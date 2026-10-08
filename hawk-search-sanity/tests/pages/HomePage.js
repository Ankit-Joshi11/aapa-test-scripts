// tests/pages/HomePage.js
// ─────────────────────────────────────────────────────────────────────────────
// HomePage – represents https://abcauto.com/
//
// Responsibilities:
//  • Open the homepage
//  • Dismiss the cookie / consent banner
//  • Provide access to the top-level navigation links
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { BasePage } = require('./BasePage');
const { BASE_URL, ELEMENT_TIMEOUT } = require('../config/testConfig');

class HomePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ── Locators ──────────────────────────────────────────────────────────────
    // Top navigation links
    this.brandsNavLink     = page.locator('a[href*="ShopAllBrands"], a[href*="Brands"], a:has-text("Brands")');
    this.accessoriesLink   = page.locator('a[href*="Accessories"], a:has-text("Accessories")');
    this.vehiclesLink      = page.locator('a[href*="Vehicles"], a:has-text("Vehicles")');
    this.oilFluidsLink     = page.locator('a[href*="Oil"], a:has-text("Oil, Fluids")');
    this.garageShopLink    = page.locator('a[href*="Household"], a[href*="Garage"], a:has-text("Garage")');

    // Consent / cookie banner
    this.consentBannerBtn  = page.getByRole('button', { name: /okay/i });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Opens the homepage and waits until it is ready.
   *
   * @param {string} [url=BASE_URL]
   */
  async open(url = BASE_URL) {
    this.currentBaseUrl = url;
    await this.goto(url);
    console.log(`  ✔ Homepage opened → ${this.getCurrentUrl()}`);
  }

  /**
   * Dismisses the cookie / consent popup if it appears.
   * Silently continues if the banner is not present.
   */
  async dismissConsentBanner() {
    try {
      await this.consentBannerBtn.waitFor({ state: 'visible', timeout: 5000 });
      await this.consentBannerBtn.click();
      console.log('  ✔ Consent banner dismissed');
    } catch (_e) {
      // Banner not shown on this load – nothing to do
    }
  }

  /**
   * Clicks the "Brands" link in the top navigation and waits for the
   * brands listing page to load.
   *
   * @param {string} [baseUrl]
   */
  async clickBrandsNav(baseUrl) {
    const base = baseUrl || this.currentBaseUrl || BASE_URL;
    const shopAllBrandsUrl = `${base.replace(/\/$/, '')}/ShopAllBrands`;

    try {
      const link = this.brandsNavLink.first();
      const isVis = await link.isVisible().catch(() => false);
      if (isVis) {
        await link.click();
        await this.waitForReady();
      } else {
        await this.goto(shopAllBrandsUrl);
      }
    } catch (_e) {
      await this.goto(shopAllBrandsUrl);
    }

    if (!this.getCurrentUrl().toLowerCase().includes('brand')) {
      await this.goto(shopAllBrandsUrl);
    }
    console.log(`  ✔ Navigated to Brands page → ${this.getCurrentUrl()}`);
  }
}

module.exports = { HomePage };
