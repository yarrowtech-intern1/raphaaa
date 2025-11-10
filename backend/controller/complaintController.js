const Complaint = require('../models/complaintModel');
const cloudinary = require('../config/cloudinary');

// Add a new complaint
const addComplaint = async (req, res) => {
  try {
    const { complaintType, orderId, description } = req.body;

    // Get user from token (if using authentication middleware)
    const userId = req.user ? req.user._id : null;

    if (!orderId || !description) {
      return res.status(400).json({ message: 'Order ID and description are required' });
    }

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const complaint = await Complaint.create({
      complaintType,
      orderId,
      description,
      image: imageUrl,
      user: userId, // ✅ attach user ID if available
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint,
    });
  } catch (error) {
    console.error('Error in addComplaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('user', 'name email');
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete complaint (only by owner)
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ensure the logged-in user owns the complaint
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    await complaint.deleteOne();
    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addComplaint, getComplaints, deleteComplaint };
