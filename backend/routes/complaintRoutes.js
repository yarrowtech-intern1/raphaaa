// const express = require("express");
// const router = express.Router();
// const {
//   createComplaint,
//   getUserComplaints,
//   getAllComplaints,
//   updateComplaintStatus,
// } = require("../controller/complaintController");
// const authMiddleware = require("../middleware/authMiddleware");
// const multer = require("multer");

// // ✅ basic multer setup
// const storage = multer.diskStorage({});
// const upload = multer({ storage });

// // ROUTES
// router.post("/", authMiddleware, upload.single("image"), createComplaint);
// router.get("/", authMiddleware, getUserComplaints);
// router.get("/all", authMiddleware, getAllComplaints);
// router.put("/:id/status", authMiddleware, updateComplaintStatus);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { addComplaint, getComplaints, deleteComplaint } = require('../controller/complaintController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware'); // ✅ your auth middleware

router.post('/add', protect, upload.single('image'), addComplaint);
router.get('/', protect, getComplaints);

router.get("/verify/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    res.json({ exists: !!order });
  } catch {
    res.json({ exists: false });
  }
});

router.delete('/:id', protect, deleteComplaint); // ✅ new route

module.exports = router;

