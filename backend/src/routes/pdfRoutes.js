// src/routes/pdfRoutes.js (updated with all PDF-related routes)
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

// Route to get a specific PDF by UUID and also to delete it
router.route('/:uuid')
  .get(protect, getPDFByUuid)
  .delete(protect, deletePDF);

// Route for renaming a PDF
router.route('/:uuid/rename').put(protect, renamePDF);

// Route to get all PDFs and to search PDFs
router.route('/')
  .get(protect, getPDFs);

router.route('/test-cloudinary/:uuid')
  .get(protect, testCloudinary);

router.route('/search')
  .get(protect, searchPDFs);

// Route for uploading a PDF
router.route('/upload').post(protect, upload.single('pdf'), uploadPDF);

export default router;