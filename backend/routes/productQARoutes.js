const express = require("express");
const ProductQA = require("../models/ProductQA");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/qa/:productId  — list Q&A for a product (public)
router.get("/:productId", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ProductQA.find({ product: req.params.productId, isApproved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name")
        .populate("answers.user", "name"),
      ProductQA.countDocuments({ product: req.params.productId, isApproved: true }),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Q&A fetch error:", err);
    res.status(500).json({ message: "Failed to fetch Q&A" });
  }
});

// POST /api/qa/:productId  — ask a question (optionalAuth — works for guests too)
router.post("/:productId", optionalAuth, async (req, res) => {
  const { question, guestName } = req.body;
  if (!question?.trim()) return res.status(400).json({ message: "Question is required" });

  try {
    const qa = await ProductQA.create({
      product: req.params.productId,
      user: req.user?._id || null,
      guestName: req.user ? null : (guestName?.trim() || "Anonymous"),
      question: question.trim(),
    });
    await qa.populate("user", "name");
    res.status(201).json(qa);
  } catch (err) {
    console.error("Q&A post error:", err);
    res.status(500).json({ message: "Failed to post question" });
  }
});

// POST /api/qa/:questionId/answer  — answer a question (optionalAuth)
router.post("/:questionId/answer", optionalAuth, async (req, res) => {
  const { answer, guestName } = req.body;
  if (!answer?.trim()) return res.status(400).json({ message: "Answer is required" });

  try {
    const qa = await ProductQA.findById(req.params.questionId);
    if (!qa) return res.status(404).json({ message: "Question not found" });

    const isAdmin = req.user?.role === "admin" || req.user?.role === "merchantise";

    qa.answers.push({
      user: req.user?._id || null,
      guestName: req.user ? null : (guestName?.trim() || "Anonymous"),
      answer: answer.trim(),
      isSellerAnswer: isAdmin,
    });
    await qa.save();
    await qa.populate("user", "name");
    await qa.populate("answers.user", "name");
    res.json(qa);
  } catch (err) {
    console.error("Q&A answer error:", err);
    res.status(500).json({ message: "Failed to post answer" });
  }
});

// PATCH /api/qa/:questionId/helpful  — upvote a question (public)
router.patch("/:questionId/helpful", async (req, res) => {
  try {
    const qa = await ProductQA.findByIdAndUpdate(
      req.params.questionId,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!qa) return res.status(404).json({ message: "Question not found" });
    res.json({ helpful: qa.helpful });
  } catch (err) {
    res.status(500).json({ message: "Failed to upvote" });
  }
});

module.exports = router;
