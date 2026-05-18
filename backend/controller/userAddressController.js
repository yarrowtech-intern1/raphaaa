const User = require("../models/User");

const getUserIdFromReq = (req) => req.user?._id || req.user?.id;

const updateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const index = Number(req.params.index);
    const updatedAddress = req.body || {};

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Invalid address index" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!Array.isArray(user.addresses) || !user.addresses[index]) {
      return res.status(400).json({ message: "Invalid address index" });
    }

    user.addresses[index] = { ...user.addresses[index].toObject(), ...updatedAddress };
    await user.save();

    return res.json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ message: "Failed to update address" });
  }
};

module.exports = { updateAddress };

