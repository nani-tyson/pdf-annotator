import express from 'express';
import { 
  upload, 
  uploadPDF, 
  getPDFs, 
  getPDFByUuid, 
  renamePDF, 
  searchPDFs,
  deletePDF,
  testCloudinary
} from '../controllers/pdfController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific routes should come before parameterized/general routes
// Route for uploading a PDF
router.route('/upload').post(protect, upload.single('pdf'), uploadPDF);

// Route to search PDFs by name
router.route('/search').get(protect, searchPDFs);

// Test route (can be removed later)
router.route('/test-cloudinary/:uuid').get(protect, testCloudinary);

// Route to get all PDFs for the user
router.route('/').get(protect, getPDFs);

// Parameterized routes should come last
// Route for renaming a PDF
router.route('/:uuid/rename').put(protect, renamePDF);

// Route to get a specific PDF by UUID and also to delete it
router.route('/:uuid')
  .get(protect, getPDFByUuid)
  .delete(protect, deletePDF);

export default router;