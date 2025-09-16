// src/routes/highlightRoutes.js
import express from 'express';
import { createHighlight, getHighlightsByPdf, deleteHighlight, updateHighlightNote, searchHighlights } from '../controllers/highlightController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createHighlight);

router.route('/:pdfId')
  .get(protect, getHighlightsByPdf);

router.route('/search/:pdfId').get(protect, searchHighlights);

router.route('/:id')
  .put(protect, updateHighlightNote)
  .delete(protect, deleteHighlight);

export default router;
