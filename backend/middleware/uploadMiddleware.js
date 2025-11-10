const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1698654123456.jpg
  }
});

// File filter (optional, restrict to images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({ storage, fileFilter });

module.exports = upload;
