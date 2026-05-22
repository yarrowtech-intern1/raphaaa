const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const { updateAddress } = require("../controller/userAddressController");
const getUserIdFromReq = (req) => req.user?._id || req.user?.id;

// GET: Get user's saved addresses
router.get("/", protect, async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const user = await User.findById(userId).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.addresses || []);
  } catch (error) {
    console.error("GET /api/user/addresses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Add a new address
router.post("/", protect, async (req, res) => {
  const {
    firstName,
    lastName,
    address,
    landmark,
    city,
    state,
    postalCode,
    country,
    phone,
    addressType,
    isDefault,
  } = req.body;

  if (!firstName || !address || !city || !postalCode || !country || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userId = getUserIdFromReq(req);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.addresses.push({
      firstName: String(firstName || "").trim(),
      lastName: String(lastName || "").trim(),
      address,
      landmark: String(landmark || "").trim(),
      city,
      state: state || city || "N/A",
      postalCode,
      country,
      phone,
      addressType: ["Home", "Work", "Other"].includes(addressType) ? addressType : "Home",
      isDefault: Boolean(isDefault),
    });
    await user.save();
    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (error) {
    console.error("POST /api/user/addresses error:", error);
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid address data" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: Remove address by index
router.delete("/:index", protect, async (req, res) => {
  const index = parseInt(req.params.index);
  try {
    const userId = getUserIdFromReq(req);
    const user = await User.findById(userId);
    if (!user || !user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.splice(index, 1);
    await user.save();
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    console.error("DELETE /api/user/addresses/:index error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:index", protect, updateAddress);
router.put("/addresses/:index", protect, updateAddress);


module.exports = router;
