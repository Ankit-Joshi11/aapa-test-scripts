// tests/config/testConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// Central Multi-Site configuration for the Hawk Search Test Suite.
// Contains target configurations for all 14 production websites.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

/** Max ms to wait for an element to appear on the page */
const ELEMENT_TIMEOUT = 15000;

/** Max ms to wait for networkidle after navigation (soft limit) */
const NETWORK_IDLE_TIMEOUT = 5000;

/** How many subcategories to randomly pick and test per category */
const SUBCATEGORIES_TO_TEST = 2;

/** Default search keyword across sites */
const DEFAULT_SEARCH_KEYWORD = 'Cleaner';

/**
 * Multi-Site configuration definitions for all 14 websites.
 */
const SITES = [
  {
    id: 'abcauto',
    name: 'ABC Auto',
    baseUrl: 'https://abcauto.com/',
    sitemapUrl: 'https://abcauto.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Accessories',
        url: 'https://abcauto.com/Accessories/MTAwMQ',
      },
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://abcauto.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://abcauto.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Garage and Shop Products',
        url: 'https://abcauto.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'eapw',
    name: 'shop.eapw',
    baseUrl: 'https://shop.eapw.com/',
    sitemapUrl: 'https://shop.eapw.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://shop.eapw.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://shop.eapw.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
    ],
  },
  {
    id: 'bumpertobumper',
    name: 'Bumper to Bumper',
    baseUrl: 'https://shopbumpertobumper.com/',
    sitemapUrl: 'https://shopbumpertobumper.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://shopbumpertobumper.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://shopbumpertobumper.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://shopbumpertobumper.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://shopbumpertobumper.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'autovalue',
    name: 'Auto Value Stores',
    baseUrl: 'https://autovaluestores.com/',
    sitemapUrl: 'https://autovaluestores.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Oils, Fluids, Waxes & Paint',
        url: 'https://autovaluestores.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Accessories',
        url: 'https://autovaluestores.com/Accessories/MTAwMQ',
      },
      {
        name: 'Tools & Shop Supplies',
        url: 'https://autovaluestores.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
    ],
  },
  {
    id: 'arnoldmotors',
    name: 'Arnold Motors',
    baseUrl: 'https://arnoldmotorsupply.com/',
    sitemapUrl: 'https://arnoldmotorsupply.com/sitemap',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Equipment, Tools & Supplies',
        url: 'https://arnoldmotorsupply.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://arnoldmotorsupply.com/Accessories/MTAwMQ',
      },
      {
        name: 'OILS & FLUIDS',
        url: 'https://arnoldmotorsupply.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Specialty',
        url: 'https://arnoldmotorsupply.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'myautovalue',
    name: 'My Auto Value Store',
    baseUrl: 'https://myautovaluestore.com/',
    sitemapUrl: 'https://myautovaluestore.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://myautovaluestore.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://myautovaluestore.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://myautovaluestore.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://myautovaluestore.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'monumentcarparts',
    name: 'Monument Car Parts',
    baseUrl: 'https://www.monumentcarparts.com/',
    sitemapUrl: 'https://www.monumentcarparts.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://www.monumentcarparts.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://www.monumentcarparts.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://www.monumentcarparts.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://www.monumentcarparts.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'storeautovalue',
    name: 'Store Auto Value Parts Canada',
    baseUrl: 'https://store.autovalueparts.ca/',
    sitemapUrl: 'https://store.autovalueparts.ca/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://store.autovalueparts.ca/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://store.autovalueparts.ca/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://store.autovalueparts.ca/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://store.autovalueparts.ca/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'maslack',
    name: 'Maslack',
    baseUrl: 'https://shopmaslack.com/',
    sitemapUrl: 'https://shopmaslack.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://shopmaslack.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://shopmaslack.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://shopmaslack.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://shopmaslack.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'baxter',
    name: 'Baxter Auto Parts',
    baseUrl: 'https://baxterautoparts.com/',
    sitemapUrl: 'https://baxterautoparts.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://baxterautoparts.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://baxterautoparts.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://baxterautoparts.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
    ],
  },
  {
    id: 'b2bkansas',
    name: 'B2B Kansas',
    baseUrl: 'https://b2bkansas.com/',
    sitemapUrl: 'https://b2bkansas.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Shop by Category',
        url: 'https://b2bkansas.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://b2bkansas.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Accessories',
        url: 'https://b2bkansas.com/Accessories/MTAwMQ',
      },
    ],
  },
  {
    id: 'pistonring',
    name: 'Piston Ring Service',
    baseUrl: 'https://shop.pistonringservice.com/',
    sitemapUrl: 'https://shop.pistonringservice.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Vehicles, Equipment, Tools, and Supplies',
        url: 'https://shop.pistonringservice.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories',
        url: 'https://shop.pistonringservice.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oil, Fluids and Chemicals',
        url: 'https://shop.pistonringservice.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Household, Shop and Office Products',
        url: 'https://shop.pistonringservice.com/Household%2C-Shop-and-Office-Products/MTA0NA',
      },
    ],
  },
  {
    id: 'centropiaz',
    name: 'Centro Piezas Plus (Staging)',
    baseUrl: 'https://staging.centropiezasplus.com/',
    sitemapUrl: 'https://staging.centropiezasplus.com/site-map',
    searchKeyword: 'Aceite',
    categories: [
      {
        name: 'Performance y tuning',
        url: 'https://staging.centropiezasplus.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Accessories and tools',
        url: 'https://staging.centropiezasplus.com/Accessories/MTAwMQ',
      },
      {
        name: 'Oils, Fluids, Waxes and Paint',
        url: 'https://staging.centropiezasplus.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
    ],
  },
  {
    id: 'arnoldoil',
    name: 'Arnold Oil (A-Line)',
    baseUrl: 'https://www.alineauto.com/',
    sitemapUrl: 'https://www.alineauto.com/site-map',
    searchKeyword: 'Cleaner',
    categories: [
      {
        name: 'Equipment, Tools, and Supplies',
        url: 'https://www.alineauto.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
      },
      {
        name: 'Oil, Fluids, and Chemicals',
        url: 'https://www.alineauto.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
      },
      {
        name: 'Accessories',
        url: 'https://www.alineauto.com/Accessories/MTAwMQ',
      },
    ],
  },
];

/**
 * Returns the configured sites to test.
 * If SITE_ID or SITE is set in environment (e.g. SITE=autovalue), returns only that site.
 * Otherwise returns all 14 sites.
 */
function getTargetSites() {
  const targetId = (process.env.SITE || process.env.SITE_ID || '').toLowerCase().trim();
  if (targetId) {
    const matched = SITES.filter((s) => s.id === targetId || s.name.toLowerCase().includes(targetId));
    if (matched.length > 0) return matched;
  }
  return SITES;
}

const STAGING_SITE = {
  id: 'staging',
  name: 'Buy Auto Parts Now (Staging)',
  baseUrl: 'https://staging.buyautopartsnow.com/',
  sitemapUrl: 'https://staging.buyautopartsnow.com/site-map',
  searchKeyword: 'Cleaner',
  categories: [
    {
      name: 'Vehicles, Equipment, Tools, and Supplies',
      url: 'https://staging.buyautopartsnow.com/Vehicles%2C-Equipment%2C-Tools%2C-and-Supplies/MTAxOA',
    },
    {
      name: 'Accessories',
      url: 'https://staging.buyautopartsnow.com/Accessories/MTAwMQ',
    },
    {
      name: 'Oil, Fluids and Chemicals',
      url: 'https://staging.buyautopartsnow.com/Oil%2C-Fluids-and-Chemicals/MTA0Ng',
    },
    {
      name: 'Household, Shop and Office Products',
      url: 'https://staging.buyautopartsnow.com/Household%2C-Shop-and-Office-Products/MTA0NA',
    },
  ],
};

module.exports = {
  SITES,
  STAGING_SITE,
  getTargetSites,
  ELEMENT_TIMEOUT,
  NETWORK_IDLE_TIMEOUT,
  SUBCATEGORIES_TO_TEST,
  DEFAULT_SEARCH_KEYWORD,
  // Default fallback site properties
  BASE_URL: SITES[0].baseUrl,
  TOP_LEVEL_CATEGORIES: SITES[0].categories,
  SITEMAP_URL: SITES[0].sitemapUrl,
  SEARCH_KEYWORDS: ['Cleaner', 'brakes', 'battery'],
};

