const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || "https://raphaaa.onrender.com";

// GET /sitemap.xml
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .select("name skuCode updatedAt")
      .lean();

    const staticPages = [
      { url: "/",                   priority: "1.0",  changefreq: "daily" },
      { url: "/collections/all",    priority: "0.9",  changefreq: "daily" },
      { url: "/about",              priority: "0.6",  changefreq: "monthly" },
      { url: "/contact-us",         priority: "0.5",  changefreq: "monthly" },
      { url: "/refer",              priority: "0.6",  changefreq: "monthly" },
      { url: "/privacy-policy",     priority: "0.3",  changefreq: "yearly" },
      { url: "/terms",              priority: "0.3",  changefreq: "yearly" },
      { url: "/shipping-policy",    priority: "0.3",  changefreq: "yearly" },
      { url: "/return-policy",      priority: "0.3",  changefreq: "yearly" },
      { url: "/cancellation-policy",priority: "0.3",  changefreq: "yearly" },
    ];

    const productEntries = products.map((p) => {
      const slug = p.name.toLowerCase().replace(/\s+/g, "-");
      const sku  = p.skuCode || p._id;
      return {
        url: `/product/${slug}/p/${encodeURIComponent(sku)}`,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : undefined,
        priority: "0.8",
        changefreq: "weekly",
      };
    });

    const allEntries = [...staticPages, ...productEntries];

    const urlTags = allEntries
      .map(({ url, lastmod, priority, changefreq }) => `
  <url>
    <loc>${FRONTEND}${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlTags}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    console.error("sitemap error:", err);
    res.status(500).send("Failed to generate sitemap");
  }
});

module.exports = router;
