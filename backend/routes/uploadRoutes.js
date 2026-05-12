const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up where and how the files should be saved
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Save them to the "uploads" folder in our backend
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Give the file a unique name using the current timestamp
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check to make sure they are only uploading images
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Initialize the multer tool
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @route   POST /api/upload
// @desc    Upload a single image and return its path
router.post('/', upload.single('image'), (req, res) => {
  // Return the path where it is saved (e.g., /uploads/image-123.jpg)
  res.send(`/${req.file.path.replace('\\', '/')}`);
});

module.exports = router;
