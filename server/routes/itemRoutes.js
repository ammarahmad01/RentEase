import express from 'express';
import { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem, 
  deleteItem, 
  getUserItems 
} from '../controllers/itemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in uploads/ directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png)'));
    }
  },
});

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/:id', getItemById);

// Protected routes - require authentication
router.use(protect);
router.post('/', createItem);
router.put('/:id', updateItem); // No multer middleware here
router.delete('/:id', deleteItem); // No multer middleware here
router.get('/user/listings', getUserItems);

// File upload route
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Return the URLs of the uploaded images
    const imageUrls = files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ imageUrls });
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;