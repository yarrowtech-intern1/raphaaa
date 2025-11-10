export const updateAddress = async (req, res) => {
  try {
    const { userid } = req.headers;
    const { index } = req.params;
    const updatedAddress = req.body;

    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.addresses[index])
      return res.status(400).json({ message: "Invalid address index" });

    user.addresses[index] = updatedAddress;
    await user.save();

    res.json({ addresses: user.addresses });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Failed to update address" });
  }
};
