/**
 * Site photography, self-hosted from /public/images so pages never depend on
 * third-party hotlinking. Sources and licences are listed on /credits.
 */
export const IMAGES = {
  heroMarket: '/images/site/hero-market.jpg',
  farmRows: '/images/site/farm-rows.jpg',
  farmHandshake: '/images/site/farm-handshake.jpg',
  vegetableSpread: '/images/site/vegetable-spread.jpg',
  farmPunjabHarvest: '/images/site/farm-punjab-harvest.jpg',
  farmHimachalCabbage: '/images/site/farm-himachal-cabbage.jpg',
  farmNilgiris: '/images/site/farm-nilgiris.jpg',
  farmChilliDrying: '/images/site/farm-guntur-chilli-drying.jpg',
} as const;

export const SITE_IMAGE_CREDITS = [
  { image: IMAGES.heroMarket, label: 'Farm stall produce', credit: 'Unsplash License', url: 'https://unsplash.com/license' },
  { image: IMAGES.farmRows, label: 'Crop rows', credit: 'Unsplash License', url: 'https://unsplash.com/license' },
  { image: IMAGES.farmHandshake, label: 'Wheat field', credit: 'Unsplash License', url: 'https://unsplash.com/license' },
  { image: IMAGES.vegetableSpread, label: 'Vegetable spread', credit: 'Unsplash License', url: 'https://unsplash.com/license' },
  {
    image: IMAGES.farmPunjabHarvest,
    label: 'Farm-fresh vegetables, Punjab',
    credit: 'CC BY-SA 4.0 · Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/File:Punjab%E2%80%99s_farm-fresh_vegetables.jpg',
  },
  {
    image: IMAGES.farmHimachalCabbage,
    label: 'Vegetable farm, Himachal Pradesh',
    credit: 'CC BY-SA 2.0 · Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/File:A_vegetable_farm_in_Himachal_Pradesh.jpg',
  },
  {
    image: IMAGES.farmNilgiris,
    label: 'Farm vegetables, Bikkatty, Nilgiris',
    credit: 'CC BY-SA 4.0 · Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/File:Farm_Vegetables_Bikkatty_Nilgiris_Sep24_A7CR_02954.jpg',
  },
  {
    image: IMAGES.farmChilliDrying,
    label: 'Chillies drying, Guntur district',
    credit: 'CC BY-SA 3.0 · Wikimedia Commons',
    url: 'https://commons.wikimedia.org/wiki/File:Dried_Chillies_at_Grandhasiri_Village_in_Guntur_district.JPG',
  },
];
