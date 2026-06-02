const express = require("express");
const User = require("../models/User");
const { sendMail } = require("../utils/sendMail");
const { protect, admin, adminOrMerchantise } = require("../middleware/authMiddleware");
const { getJson, setJson } = require("../utils/redisCache");

const router = express.Router();

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

// @route GET /api/admin/users
// @desc Get all users (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const cacheKey = `role:${req.user.role}:users`;
        const cached = await getJson("dashboard", cacheKey);
        if (cached) return res.json(cached);

        const users = await User.find({});
        await setJson("dashboard", cacheKey, users, 60);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// @route POST /api/admin/users
// @desc Add a new user (admin only)
// @access Private/Admin
router.post("/", protect, admin, adminOrMerchantise, async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        user = new User({
            name,
            email: normalizedEmail,
            password,
            role: role || "customer",
        });
        await user.save();

        let emailSent = false;
        try {
            await sendMail({
                to: normalizedEmail,
                subject: "Your Raphaaa account has been created",
                message: `
                  <p>Hi ${escapeHtml(user.name)},</p>
                  <p>Your Raphaaa account has been created by an admin.</p>
                  <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
                  <p><strong>Password:</strong> <code>${escapeHtml(password)}</code></p>
                  <p><strong>Role:</strong> ${escapeHtml(user.role)}</p>
                  <p>You can now log in to your account.</p>
                  <p>Love,<br/>Team Raphaaa</p>
                `,
            });
            emailSent = true;
        } catch (mailError) {
            console.error("Admin user credential email failed:", {
                message: mailError?.message,
                code: mailError?.code,
                response: mailError?.response?.body || mailError?.response?.data,
                recipient: normalizedEmail,
            });
        }

        res.status(201).json({
            message: emailSent
                ? "User created successfully and credentials sent by email"
                : "User created successfully, but credentials email could not be sent",
            user,
            emailSent,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// @route PUT /api/admin/users/:id
// @desc Update user details (Admin only)
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
        }
        const updatedUser = await user.save();
        res.json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// @route DELETE /api/admin/users/:id
// @desc Delete a user
// @access Private/Admin
router.delete("/:id", protect, admin, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server error" });
    }
})

module.exports = router;
