const express    = require("express");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const HeroSlide  = require("../models/HeroSlide");
const { protect, admin } = require("../middleware/authMiddleware");

const router  = express.Router();
const upload  = multer({ storage: multer.diskStorage({}) });

// ── GET /api/hero-slides  (public — frontend reads this)
router.get("/", async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isVisible: true }).sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch slides" });
  }
});

// ── GET /api/hero-slides/all  (admin — includes hidden)
router.get("/all", protect, admin, async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch slides" });
  }
});

// ── POST /api/hero-slides  (admin — create slide)
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl || "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "raphaaa/hero" });
      imageUrl = result.secure_url;
    }

    if (!imageUrl) return res.status(400).json({ message: "Image is required" });

    const count = await HeroSlide.countDocuments();
    const slide = await HeroSlide.create({
      image:            imageUrl,
      badge:            req.body.badge            || "",
      title:            req.body.title            || "New Slide",
      subtitle:         req.body.subtitle         || "",
      description:      req.body.description      || "",
      ctaText:          req.body.ctaText          || "Shop Now",
      ctaLink:          req.body.ctaLink          || "/collections/all",
      ctaSecondaryText: req.body.ctaSecondaryText || "",
      ctaSecondaryLink: req.body.ctaSecondaryLink || "",
      textAlign:        req.body.textAlign        || "left",
      overlayColor:     req.body.overlayColor     || "from-sky-950/80 via-sky-900/40 to-transparent",
      isVisible:        req.body.isVisible !== "false",
      order:            count,
    });

    res.status(201).json(slide);
  } catch (err) {
    console.error("hero slide create error:", err);
    res.status(500).json({ message: "Failed to create slide" });
  }
});

// ── PUT /api/hero-slides/:id  (admin — update slide)
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "raphaaa/hero" });
      slide.image = result.secure_url;
    } else if (req.body.imageUrl) {
      slide.image = req.body.imageUrl;
    }

    const fields = ["badge","title","subtitle","description","ctaText","ctaLink","ctaSecondaryText","ctaSecondaryLink","textAlign","overlayColor","order"];
    fields.forEach((f) => { if (req.body[f] !== undefined) slide[f] = req.body[f]; });
    if (req.body.isVisible !== undefined) slide.isVisible = req.body.isVisible !== "false" && req.body.isVisible !== false;

    await slide.save();
    res.json(slide);
  } catch (err) {
    console.error("hero slide update error:", err);
    res.status(500).json({ message: "Failed to update slide" });
  }
});

// ── DELETE /api/hero-slides/:id  (admin)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await HeroSlide.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete slide" });
  }
});

// ── PATCH /api/hero-slides/:id/toggle  (admin — toggle visibility)
router.patch("/:id/toggle", protect, admin, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    slide.isVisible = !slide.isVisible;
    await slide.save();
    res.json({ isVisible: slide.isVisible });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle slide" });
  }
});

// ── POST /api/hero-slides/reorder  (admin — update order array)
router.post("/reorder", protect, admin, async (req, res) => {
  try {
    const { order } = req.body; // array of { id, order }
    await Promise.all(order.map(({ id, order: o }) => HeroSlide.findByIdAndUpdate(id, { order: o })));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to reorder slides" });
  }
});

module.exports = router;
