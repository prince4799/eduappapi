const multer = require('multer');
const fs = require('fs');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory to store the uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const uploadMiddleware = upload.single('thumbnail');

const handleUpload = (req, res, next) => { 
    try { 
      const thumbnailPath = req.file.path; // Get the path of the saved file
      req.thumbnailPath = thumbnailPath; // Store the path for later use
  
      next();
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred while processing the upload.' });
    }
  };
  

module.exports = { uploadMiddleware, handleUpload };
