import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Makeup & Cosmetics",
    slug: "makeup-cosmetics",
    description:
      "Lip colour, palettes and tools for a considered everyday face.",
    image: "/images/categories/makeup-cosmetics.webp",
    sortOrder: 1,
  },
  {
    name: "Skincare",
    slug: "skincare",
    description:
      "Oils, creams and slow rituals for skin that looks rested and cared for.",
    image: "/images/categories/skincare.webp",
    sortOrder: 2,
  },
  {
    name: "Artificial Jewellery",
    slug: "artificial-jewellery",
    description:
      "Statement gold-tone pieces and pearls, made for repeat wear.",
    image: "/images/categories/artificial-jewellery.webp",
    sortOrder: 3,
  },
  {
    name: "Makeup Kits",
    slug: "makeup-kits",
    description:
      "Complete edits, brush collections and travel-ready vanity sets.",
    image: "/images/categories/makeup-kits.webp",
    sortOrder: 4,
  },
  {
    name: "Beauty Essentials",
    slug: "beauty-essentials",
    description:
      "Fragrance, facial tools and the finishing touches of a daily routine.",
    image: "/images/categories/beauty-essentials.webp",
    sortOrder: 5,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description:
      "Clips, pouches and small luxuries that complete the everyday.",
    image: "/images/categories/accessories.webp",
    sortOrder: 6,
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000);

const products = [
  {
    name: "Botanical Renewal Facial Oil",
    slug: "botanical-renewal-facial-oil",
    description:
      "A lightweight botanical facial oil that leaves skin feeling supple, softened and comfortably nourished. A few warmed drops are enough for an evening ritual or a dewy daytime finish.",
    details:
      "30 ml glass dropper bottle\nUse 2–3 drops on cleansed skin, morning or evening\nFragrance-free, silicone-free formula story\nStore away from direct sunlight",
    categorySlug: "skincare",
    images: ["/images/products/facial-oil.webp"],
    price: 1290,
    originalPrice: 1590,
    sku: "OMX-SK-101",
    stock: 36,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variantLabel: "Size",
    variantOptions: ["15 ml", "30 ml"],
    viewCount: 186,
    createdAt: daysAgo(64),
  },
  {
    name: "Silk Cream Moisturiser",
    slug: "silk-cream-moisturiser",
    description:
      "A cushiony white cream with a soft, powdery finish. It melts into the skin and layers beautifully under makeup, making it a quiet essential in the everyday routine.",
    details:
      "50 g frosted glass jar\nMassage a small amount over face and neck\nBest used after serum\nUse the spatula included and keep the jar closed",
    categorySlug: "skincare",
    images: ["/images/products/silk-cream.webp"],
    price: 1890,
    originalPrice: 2190,
    sku: "OMX-SK-102",
    stock: 0,
    status: "OUT_OF_STOCK",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    viewCount: 163,
    createdAt: daysAgo(82),
  },
  {
    name: "Golden Dew Eye Cream",
    slug: "golden-dew-eye-cream",
    description:
      "A rich, silken eye cream with a soft golden finish. Pat a little around the orbital bone and let the balm settle before makeup.",
    details:
      "15 ml frosted jar\nApply morning and evening with the ring finger\nKeep out of direct sunlight\nPatch test before first use",
    categorySlug: "skincare",
    images: ["/images/products/eye-cream.webp"],
    price: 1190,
    originalPrice: 1390,
    sku: "OMX-SK-103",
    stock: 24,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 97,
    createdAt: daysAgo(10),
  },
  {
    name: "Hydra Calm Face Mist",
    slug: "hydra-calm-face-mist",
    description:
      "A fine, even face mist for a quick reset between moments. Keep it on the vanity for a fresh, hydrated finish over bare skin or makeup.",
    details:
      "100 ml pump bottle\nClose eyes and mist 20 cm from the face\nUse after cleansing or as a mid-day refresh\nStore upright",
    categorySlug: "beauty-essentials",
    images: ["/images/products/face-mist.webp"],
    price: 690,
    originalPrice: null,
    sku: "OMX-BE-201",
    stock: 42,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 88,
    createdAt: daysAgo(16),
  },
  {
    name: "Jade Sculpt Gua Sha",
    slug: "jade-sculpt-gua-sha",
    description:
      "A smooth jade-toned facial tool shaped for gentle, sweeping massage. Pair it with facial oil and a slow two minutes at the end of the day.",
    details:
      "One polished facial tool\nWipe clean after each use\nUse with facial oil to reduce friction\nStore in the cotton pouch provided",
    categorySlug: "beauty-essentials",
    images: ["/images/products/gua-sha.webp"],
    price: 890,
    originalPrice: 1090,
    sku: "OMX-BE-202",
    stock: 18,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 121,
    createdAt: daysAgo(8),
  },
  {
    name: "Velvet Bloom Lipstick",
    slug: "velvet-bloom-lipstick",
    description:
      "A creamy, soft-matte lipstick with a comfortable wear and a blurred, petal-like finish. Choose from three everyday shades.",
    details:
      "3.5 g slim bullet\nSoft-matte finish\nApply directly or tap in with a fingertip\nBlot once for a lighter stain",
    categorySlug: "makeup-cosmetics",
    images: ["/images/products/lipstick.webp"],
    price: 649,
    originalPrice: 799,
    sku: "OMX-MU-301",
    stock: 58,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variantLabel: "Shade",
    variantOptions: ["Rosewood", "Brick", "Mauve"],
    viewCount: 224,
    createdAt: daysAgo(73),
  },
  {
    name: "Rose Nude Eyeshadow Palette",
    slug: "rose-nude-eyeshadow-palette",
    description:
      "Six wearable rose and nude shades in matte and soft shimmer finishes. The compact pans make it easy to build a quick eye with one brush.",
    details:
      "6 x 1.2 g pans\nMatte and shimmer finishes\nUse a light hand for daytime or layer for depth\nKeep the palette closed after use",
    categorySlug: "makeup-cosmetics",
    images: ["/images/products/eyeshadow-palette.webp"],
    price: 1499,
    originalPrice: 1799,
    sku: "OMX-MU-302",
    stock: 31,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 109,
    createdAt: daysAgo(6),
  },
  {
    name: "Soft Focus Brush Trio",
    slug: "soft-focus-brush-trio",
    description:
      "Three essential brushes for an effortless finish: a powder brush, a blush brush and a crease brush, cut for soft edges and easy blending.",
    details:
      "3 synthetic-bristle brushes\nPowder, blush and crease shapes\nWash with gentle soap and air-dry flat\nStore in the travel sleeve provided",
    categorySlug: "makeup-cosmetics",
    images: ["/images/products/brush-trio.webp"],
    price: 999,
    originalPrice: 1299,
    sku: "OMX-MU-303",
    stock: 26,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 74,
    createdAt: daysAgo(14),
  },
  {
    name: "The Complete Ritual Makeup Kit",
    slug: "the-complete-ritual-makeup-kit",
    description:
      "A considered full-face edit in one case: everyday base, colour and tools arranged for travel or the vanity. The kit is designed for effortless gifting.",
    details:
      "Palette, cheek colour, lip colour and brushes in one case\nZipped travel case included\nWipe the case clean with a soft cloth\nContents presented in a reusable box",
    categorySlug: "makeup-kits",
    images: ["/images/products/ritual-kit.webp"],
    price: 2499,
    originalPrice: 2999,
    sku: "OMX-KT-401",
    stock: 14,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isDemo: true,
    viewCount: 201,
    createdAt: daysAgo(56),
  },
  {
    name: "Artist's Brush Collection",
    slug: "artists-brush-collection",
    description:
      "A generous brush wardrobe for the makeup lover who likes options. Each brush is labelled, balanced and arranged in a standing case.",
    details:
      "10 everyday face and eye brushes\nLabelled handles\nStanding canvas case included\nWash after use and air-dry flat",
    categorySlug: "makeup-kits",
    images: ["/images/products/brush-collection.webp"],
    price: 1799,
    originalPrice: 2199,
    sku: "OMX-KT-402",
    stock: 21,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 84,
    createdAt: daysAgo(12),
  },
  {
    name: "On-the-Go Vanity Kit",
    slug: "on-the-go-vanity-kit",
    description:
      "A compact edit for the handbag: the brushes and daily essentials you reach for most, held in a soft zip case.",
    details:
      "Soft vanity case\nFour touch-up tools\nWipe-clean lining\nDesigned for travel and daily touch-ups",
    categorySlug: "makeup-kits",
    images: ["/images/products/vanity-kit.webp"],
    price: 1299,
    originalPrice: null,
    sku: "OMX-KT-403",
    stock: 33,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    viewCount: 63,
    createdAt: daysAgo(18),
  },
  {
    name: "Gilded Bloom Necklace",
    slug: "gilded-bloom-necklace",
    description:
      "A sculptural gold-tone bloom on a fine collar. Designed to sit alone against bare skin or layer quietly with a chain.",
    details:
      "One necklace with a sculpted floral pendant\nAdjustable closure\nWipe with a soft dry cloth after wear\nKeep away from perfume and water",
    categorySlug: "artificial-jewellery",
    images: ["/images/products/gilded-necklace.webp"],
    price: 1899,
    originalPrice: 2299,
    sku: "OMX-JW-501",
    stock: 20,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    variantLabel: "Finish",
    variantOptions: ["Gold tone", "Rose gold tone"],
    viewCount: 212,
    createdAt: daysAgo(48),
  },
  {
    name: "Heritage Gold Jewellery Set",
    slug: "heritage-gold-jewellery-set",
    description:
      "A coordinated gold-tone set of necklace, earrings, bracelet and ring. An occasion edit that feels considered without feeling loud.",
    details:
      "Necklace, earrings, bracelet and ring\nPresented in a keepsake box\nWipe clean after wear\nKeep the set dry and separately stored",
    categorySlug: "artificial-jewellery",
    images: ["/images/products/jewellery-set.webp"],
    price: 2799,
    originalPrice: 3499,
    sku: "OMX-JW-502",
    stock: 0,
    status: "OUT_OF_STOCK",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    viewCount: 178,
    createdAt: daysAgo(71),
  },
  {
    name: "Pearl Drop Earrings",
    slug: "pearl-drop-earrings",
    description:
      "A pair of luminous pearl-drop earrings with a delicate metal frame. Understated enough for daytime and luminous at night.",
    details:
      "One pair of drop earrings\nSecure post closure\nWipe gently with a soft cloth\nStore flat to protect the finish",
    categorySlug: "artificial-jewellery",
    images: ["/images/products/pearl-earrings.webp"],
    price: 899,
    originalPrice: 1099,
    sku: "OMX-JW-503",
    stock: 27,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    variantLabel: "Finish",
    variantOptions: ["Pearl", "Gold tone"],
    viewCount: 96,
    createdAt: daysAgo(9),
  },
  {
    name: "Everyday Gold Hoops",
    slug: "everyday-gold-hoops",
    description:
      "Medium-weight gold-tone hoops with a clean, rounded profile. A simple shape that works with everything in the wardrobe.",
    details:
      "One pair of hoop earrings\nLightweight hollow construction\nWipe after wear\nAvoid contact with water and fragrance",
    categorySlug: "artificial-jewellery",
    images: ["/images/products/gold-hoops.webp"],
    price: 749,
    originalPrice: 899,
    sku: "OMX-JW-504",
    stock: 45,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    viewCount: 92,
    createdAt: daysAgo(21),
  },
  {
    name: "The Everyday Claw Clip",
    slug: "the-everyday-claw-clip",
    description:
      "A warm beige claw clip with a wide, comfortable grip. Small enough for a half-up style and strong enough for a full twist.",
    details:
      "One 9 cm claw clip\nMatte cellulose-acetate look\nWipe clean with a damp cloth\nNot heat resistant",
    categorySlug: "accessories",
    images: ["/images/products/claw-clip.webp"],
    price: 399,
    originalPrice: null,
    sku: "OMX-AC-601",
    stock: 60,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    variantLabel: "Colour",
    variantOptions: ["Sand", "Espresso"],
    viewCount: 54,
    createdAt: daysAgo(7),
  },
  {
    name: "Travel Vanity Pouch",
    slug: "travel-vanity-pouch",
    description:
      "A soft, structured pouch for the essentials that travel with you. Generous enough for brushes, skincare minis and a small mirror.",
    details:
      "Quilted zip pouch\nWipe-clean inner lining\nFits a compact brush set and minis\nSpot clean only",
    categorySlug: "accessories",
    images: ["/images/products/vanity-pouch.webp"],
    price: 649,
    originalPrice: 799,
    sku: "OMX-AC-602",
    stock: 38,
    status: "AVAILABLE",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    variantLabel: "Colour",
    variantOptions: ["Sand", "Olive"],
    viewCount: 48,
    createdAt: daysAgo(15),
  },
  {
    name: "Signature Eau de Parfum",
    slug: "signature-eau-de-parfum",
    description:
      "A warm, soft-focus fragrance for everyday wear: a quiet blend that settles close to the skin and lingers through the day.",
    details:
      "50 ml glass bottle\nSpray onto pulse points from 15 cm\nDo not rub after application\nStore away from heat and light",
    categorySlug: "beauty-essentials",
    images: ["/images/products/eau-de-parfum.webp"],
    price: 1999,
    originalPrice: 2499,
    sku: "OMX-BE-203",
    stock: 23,
    status: "AVAILABLE",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    viewCount: 205,
    createdAt: daysAgo(39),
  },
  {
    name: "The Emerald Edit",
    slug: "the-emerald-edit",
    description:
      "A limited makeup edit built around emerald and soft neutral tones. Arriving in the next OMNEXA collection.",
    details:
      "A curated palette, liner and brush set\nPresented in a reusable case\nLaunch details to be announced",
    categorySlug: "makeup-kits",
    images: ["/images/products/emerald-kit.webp"],
    price: 0,
    originalPrice: null,
    sku: "OMX-KT-404",
    stock: 0,
    status: "COMING_SOON",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    viewCount: 42,
    createdAt: daysAgo(4),
  },
  {
    name: "Lumière Body Ritual",
    slug: "lumiere-body-ritual",
    description:
      "A slow body-care ritual in the making: a soft-textured scrub and a finishing oil, designed to be used together.",
    details:
      "Body scrub and finishing oil duo\nLaunch details to be announced",
    categorySlug: "beauty-essentials",
    images: ["/images/products/body-ritual.webp"],
    price: 0,
    originalPrice: null,
    sku: "OMX-BE-204",
    stock: 0,
    status: "COMING_SOON",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    viewCount: 37,
    createdAt: daysAgo(3),
  },
  {
    name: "Solstice Pearl Drops",
    slug: "solstice-pearl-drops",
    description:
      "A future addition to the pearl story: sculptural drops with a softer, warmer stone. Launching with the Solstice collection.",
    details:
      "One pair of pearl drop earrings\nLaunch details to be announced",
    categorySlug: "artificial-jewellery",
    images: ["/images/products/solstice-pearls.webp"],
    price: 0,
    originalPrice: null,
    sku: "OMX-JW-505",
    stock: 0,
    status: "COMING_SOON",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    viewCount: 29,
    createdAt: daysAgo(2),
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "OMNEXA Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set before seeding. See .env.example.",
    );
  }

  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: "ADMIN", passwordHash, name: adminName },
    create: {
      email: adminEmail.toLowerCase(),
      name: adminName,
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${product.categorySlug}`);

    const data = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      details: product.details,
      categoryId,
      images: JSON.stringify(product.images),
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      sku: product.sku,
      stock: product.stock,
      status: product.status,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      isPublished: true,
      isDemo: product.isDemo ?? true,
      variantLabel: product.variantLabel ?? null,
      variantOptions: product.variantOptions
        ? JSON.stringify(product.variantOptions)
        : null,
      viewCount: product.viewCount,
      createdAt: product.createdAt,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: data,
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      businessName: "OMNEXA",
      addressLine1: "Sachi Dadi, Shiv Mandir, Main Street No. 1",
      addressLine2: "Begu Rd, Sukh Sagar Colony",
      city: "Sirsa",
      state: "Haryana",
      pincode: "125055",
      contactEmail:
        process.env.STORE_CONTACT_EMAIL || "omnexaenterprise@gmail.com",
      contactPhone: "+91 80599 12655",
      whatsapp: "+91 80599 12655",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.9!2d75.0416858!3d29.5058874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39114d0016f49a8f%3A0x1b8a04f2c46b11ea!2sOMNEXA%20ENTERPRISE!5e0!3m2!1sen!2sin!4v1700000000000",
      mapLink: "https://share.google/MhimXAOk4LDnQzeDP",
      googleBusinessUrl: "https://share.google/s0gMtvmi6xFHP8yib",
      whatsappChannelUrl:
        process.env.WHATSAPP_CHANNEL_URL ||
        "https://whatsapp.com/channel/0029VbD0oy79sBI5P6MSla0d",
      whatsappCatalogueUrl:
        process.env.WHATSAPP_CATALOGUE_URL || "https://wa.me/c/918059912655",
      amazonUrl: process.env.AMAZON_STORE_URL || "",
      flipkartUrl:
        process.env.FLIPKART_STORE_URL ||
        "https://www.flipkart.com/sellers?pid=ERGHZTUJKZFZVXEF&utm",
    },
  });

  console.log(
    `Seeded ${categories.length} categories, ${products.length} demo products and the admin account (${adminEmail}).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
