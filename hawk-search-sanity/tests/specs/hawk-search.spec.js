// @ts-check
// tests/specs/hawk-search.spec.js
// ─────────────────────────────────────────────────────────────────────────────
// Hawk Search Master Sanity Suite (Multi-Site with Rich Reporting)
//
// Purpose : Single master spec file that runs all Hawk Search sanity flows
//           across all 5 configured production websites:
//           1. ABC Auto (https://abcauto.com/)
//           2. shop.eapw (https://shop.eapw.com/)
//           3. Bumper to Bumper (https://shopbumpertobumper.com/)
//           4. Auto Value Stores (https://autovaluestores.com/)
//           5. Arnold Motors (https://arnoldmotorsupply.com/)
//
// Test Flows executed per site:
//   1. Brand Search & Navigation (all brands → random brand → product results)
//   2. Category & Subcategory Search (all site categories → 2 random subcategories each)
//   3. Keyword Search (click search input → enter "Cleaner" → press Enter → product results)
//   4. Site Map Search & Navigation (sitemap index → random link → destination content)
//
// Reporting Enhancements:
//   • Each step recorded with execution details in Playwright HTML Report
//   • Formatted summary tables with counts & clickable URLs attached directly to test reports
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const { test, expect } = require('@playwright/test');

// Page Objects
const { HomePage }         = require('../pages/HomePage');
const { BrandsPage }       = require('../pages/BrandsPage');
const { BrandResultsPage } = require('../pages/BrandResultsPage');
const { CategoryPage }     = require('../pages/CategoryPage');
const { SubcategoryPage }  = require('../pages/SubcategoryPage');
const { SearchPage }       = require('../pages/SearchPage');
const { SitemapPage }      = require('../pages/SitemapPage');

// Configuration & Utilities
const {
  getTargetSites,
  SUBCATEGORIES_TO_TEST,
} = require('../config/testConfig');
const { pickRandom } = require('../helpers/navigationHelper');
const { attachSummary, attachCategoryResults } = require('../helpers/reportHelper');

// Retrieve targeted sites (all 5 by default, or filtered by SITE env var)
const targetSites = getTargetSites();

// ─────────────────────────────────────────────────────────────────────────────
// Execute Test Suite for Each Target Site
// ─────────────────────────────────────────────────────────────────────────────

for (const site of targetSites) {
  test.describe(`Hawk Search - ${site.name} (${site.baseUrl})`, () => {

    // Setup hook: Open homepage and dismiss cookie/consent banner before each test
    test.beforeEach(async ({ page }) => {
      await test.step(`Open homepage and dismiss banners: ${site.baseUrl}`, async () => {
        const homePage = new HomePage(page);
        await homePage.open(site.baseUrl);
        await homePage.dismissConsentBanner();
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 1. BRAND SEARCH
    // ─────────────────────────────────────────────────────────────────────────
    test(`1. Brand Search - Validate brand listing and random brand results on ${site.name}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);

      console.log('\n══════════════════════════════════════════════════════════');
      console.log(`  [${site.name}] HAWK SEARCH: 1. BRAND SEARCH & NAVIGATION`);
      console.log('══════════════════════════════════════════════════════════\n');

      const homePage         = new HomePage(page);
      const brandsPage       = new BrandsPage(page);
      const brandResultsPage = new BrandResultsPage(page);

      // Step 1: Navigate to Brands page
      await test.step('Navigate to Brands page', async () => {
        await homePage.clickBrandsNav(site.baseUrl);
        await brandsPage.assertPageIsNotBlank(`Brands listing page – ${site.name}`);
      });

      // Step 2: Collect all brands
      const allBrands = await test.step('Collect brand list and assert count > 0', async () => {
        const brands = await brandsPage.getAllBrands();
        expect(brands.length, `Brands page on ${site.name} must list at least 1 brand`).toBeGreaterThan(0);
        return brands;
      });

      // Step 3: Pick a random brand
      const [randomBrand] = pickRandom(allBrands, 1);
      console.log(`\n  ✔ [${site.name}] Randomly selected brand: "${randomBrand.name}"`);

      // Step 4: Open brand results page and validate
      const productCount = await test.step(`Navigate to selected brand: "${randomBrand.name}"`, async () => {
        await brandResultsPage.open(randomBrand.href);
        await brandResultsPage.assertBrandNameVisible(randomBrand.name);
        await brandResultsPage.assertPageIsNotBlank(`Brand page – ${site.name} > ${randomBrand.name}`);
        await brandResultsPage.assertProductsVisible(randomBrand.name);
        return await brandResultsPage.productItemsLocator.count().catch(() => 0);
      });

      // Step 5: Attach execution summary to report
      await attachSummary(testInfo, `Brand Search Summary – ${site.name}`, {
        'Website': site.name,
        'Base URL': site.baseUrl,
        'Total Brands Found': allBrands.length,
        'Selected Brand Name': randomBrand.name,
        'Selected Brand URL': randomBrand.href,
        'Products on Brand Page': productCount,
        'Status': 'PASSED',
      });

      console.log(`\n  ✅ [${site.name}] 1. Brand Search – PASSED\n`);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CATEGORY SEARCH
    // ─────────────────────────────────────────────────────────────────────────
    test(
      `2. Category Search - Validate all ${site.categories.length} categories on ${site.name}`,
      async ({ page }, testInfo) => {
        test.setTimeout(600_000);

        console.log('\n══════════════════════════════════════════════════════════');
        console.log(`  [${site.name}] HAWK SEARCH: 2. CATEGORY & SUBCATEGORY SEARCH`);
        console.log('══════════════════════════════════════════════════════════');
        console.log(`\n  Target Site       : ${site.name}`);
        console.log(`  Total categories  : ${site.categories.length}`);
        console.log(`  Subcategories/cat : ${SUBCATEGORIES_TO_TEST} (randomly selected)\n`);

        const categoryPage    = new CategoryPage(page);
        const subcategoryPage = new SubcategoryPage(page);
        /** @type {Array<{ category: string, subcategory: string, url: string, itemsCount: number }>} */
        const categoryReportResults = [];

        // Iterate through configured categories
        for (let catIdx = 0; catIdx < site.categories.length; catIdx++) {
          const category = site.categories[catIdx];

          await test.step(`Category [${catIdx + 1}/${site.categories.length}]: "${category.name}"`, async () => {
            console.log(`\n  ──────────────────────────────────────────────────────────`);
            console.log(`  [${site.name}] Category [${catIdx + 1}/${site.categories.length}]: "${category.name}"`);
            console.log(`  ──────────────────────────────────────────────────────────`);

            await categoryPage.open(category.url);
            await categoryPage.assertPageIsNotBlank(`Category – ${site.name} > ${category.name}`);
            await categoryPage.assertCategoryNameVisible(category.name);

            const subcategories = await categoryPage.getSubcategoryLinks(category.url);

            if (subcategories.length === 0) {
              console.log(`  ⚠ No subcategories found – moving to next category\n`);
              categoryReportResults.push({
                category: category.name,
                subcategory: 'None (0 found)',
                url: category.url,
                itemsCount: 0,
              });
              return;
            }

            const selectedSubs = pickRandom(subcategories, SUBCATEGORIES_TO_TEST);
            console.log(`\n  ✔ Randomly selected subcategories:`);
            selectedSubs.forEach((s, i) => console.log(`     ${i + 1}. "${s.name}"`));

            for (let subIdx = 0; subIdx < selectedSubs.length; subIdx++) {
              const subcategory = selectedSubs[subIdx];

              await test.step(`Subcategory [${subIdx + 1}/${selectedSubs.length}]: "${subcategory.name}"`, async () => {
                console.log(`\n     ── Subcategory [${subIdx + 1}/${selectedSubs.length}]: "${subcategory.name}"`);

                await subcategoryPage.open(subcategory.href);
                await subcategoryPage.assertUrlChangedFrom(category.url, subcategory.name);
                await subcategoryPage.assertPageIsNotBlank(
                  `Subcategory – ${site.name} > ${category.name} > ${subcategory.name}`
                );
                await subcategoryPage.assertSubcategoryNameVisible(subcategory.name);
                await subcategoryPage.assertItemsVisible(subcategory.name);

                const itemsCount = await subcategoryPage.getItemCount();
                categoryReportResults.push({
                  category: category.name,
                  subcategory: subcategory.name,
                  url: subcategory.href,
                  itemsCount: itemsCount,
                });

                // Return to parent category page
                await categoryPage.open(category.url);
                console.log(`        ✔ Returned to category page: "${category.name}"`);
              });
            }

            console.log(`\n  ✅ [${site.name}] Category "${category.name}" – DONE`);
          });
        }

        // Attach category results table to test report
        await attachCategoryResults(testInfo, site.name, categoryReportResults);

        console.log('\n══════════════════════════════════════════════════════════');
        console.log(`  ✅ [${site.name}] 2. Category Search – PASSED`);
        console.log('══════════════════════════════════════════════════════════\n');
      }
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 3. KEYWORD SEARCH
    // ─────────────────────────────────────────────────────────────────────────
    test(`3. Keyword Search - Click Search input, enter "Cleaner" and press Enter on ${site.name}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);

      const searchKeyword = site.searchKeyword || 'Cleaner';

      console.log('\n══════════════════════════════════════════════════════════');
      console.log(`  [${site.name}] HAWK SEARCH: 3. KEYWORD SEARCH ("${searchKeyword}")`);
      console.log('══════════════════════════════════════════════════════════\n');

      const searchPage = new SearchPage(page);

      const productCount = await test.step(`Execute search for "${searchKeyword}"`, async () => {
        await searchPage.search(searchKeyword);
        await searchPage.assertPageIsNotBlank(`Keyword Search – "${searchKeyword}" on ${site.name}`);
        await searchPage.assertKeywordReflected(searchKeyword);
        await searchPage.assertProductsVisible(searchKeyword, 1);
        return await searchPage.productItemsLocator.count().catch(() => 0);
      });

      // Attach summary to report
      await attachSummary(testInfo, `Keyword Search Summary – ${site.name}`, {
        'Website': site.name,
        'Search Keyword': searchKeyword,
        'Search Results URL': page.url(),
        'Products / Results Found': productCount,
        'Status': 'PASSED',
      });

      console.log(`\n  ✅ [${site.name}] 3. Keyword Search – PASSED\n`);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. SITE MAP SEARCH
    // ─────────────────────────────────────────────────────────────────────────
    test(`4. Site Map Search - Validate sitemap page and deep navigation on ${site.name}`, async ({ page }, testInfo) => {
      test.setTimeout(90_000);

      console.log('\n══════════════════════════════════════════════════════════');
      console.log(`  [${site.name}] HAWK SEARCH: 4. SITE MAP SEARCH & NAVIGATION`);
      console.log('══════════════════════════════════════════════════════════\n');

      const sitemapPage     = new SitemapPage(page);
      const subcategoryPage = new SubcategoryPage(page);
      const allSitemapLinks = await test.step(`Navigate to Sitemap index: ${site.sitemapUrl}`, async () => {
        await sitemapPage.open(site.sitemapUrl);
        await sitemapPage.assertPageIsNotBlank(`Site Map index page – ${site.name}`);
        const links = await sitemapPage.getSitemapLinks();
        expect(links.length, `Site Map on ${site.name} must list valid links`).toBeGreaterThan(5);
        return links;
      });

      const [randomLink] = pickRandom(allSitemapLinks, 1);
      console.log(`\n  ✔ [${site.name}] Randomly selected sitemap link: "${randomLink.name}" → ${randomLink.href}`);

      const itemsCount = await test.step(`Navigate to selected sitemap link: "${randomLink.name}"`, async () => {
        await subcategoryPage.open(randomLink.href);
        await subcategoryPage.assertPageIsNotBlank(`Sitemap link destination – ${site.name} > ${randomLink.name}`);
        await subcategoryPage.assertSubcategoryNameVisible(randomLink.name);
        await subcategoryPage.assertItemsVisible(randomLink.name);
        return await subcategoryPage.getItemCount();
      });

      // Attach summary to report
      await attachSummary(testInfo, `Sitemap Search Summary – ${site.name}`, {
        'Website': site.name,
        'Sitemap URL': site.sitemapUrl,
        'Total Sitemap Links Found': allSitemapLinks.length,
        'Selected Link Name': randomLink.name,
        'Selected Link URL': randomLink.href,
        'Items / Content Count': itemsCount,
        'Status': 'PASSED',
      });

      console.log(`\n  ✅ [${site.name}] 4. Site Map Search – PASSED\n`);
    });
  });
}
