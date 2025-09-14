// src/routes/highlightRoutes.js
import express from 'express';
import { createHighlight, getHighlightsByPdf, deleteHighlight } from '../controllers/highlightController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createHighlight);

router.route('/:pdfId')
  .get(protect, getHighlightsByPdf);

router.route('/delete/:id')
  .delete(protect, deleteHighlight);

export default router;
