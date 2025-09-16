// src/controllers/highlightController.js
import Highlight from '../models/Highlight.js';
import PDF from '../models/PDF.js';

// @desc    Create a new highlight for a PDF
// @route   POST /api/highlights
// @access  Private
const createHighlight = async (req, res) => {
  const { pdfId, highlightText, pageNumber, position } = req.body;
  try {
    const pdf = await PDF.findOne({ uuid: pdfId, user: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    const highlight = await Highlight.create({
      user: req.user._id,
      pdf: pdf._id, // Link to the MongoDB ObjectId of the PDF
      highlightText,
      pageNumber,
      position,
    });
    res.status(201).json(highlight);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all highlights for a specific PDF
// @route   GET /api/highlights/:pdfId
// @access  Private
const getHighlightsByPdf = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ uuid: req.params.pdfId, user: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    const highlights = await Highlight.find({ pdf: pdf._id });
    res.status(200).json(highlights);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a specific highlight
// @route   DELETE /api/highlights/:id
// @access  Private
const deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user._id });
    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }
    await highlight.deleteOne();
    res.status(200).json({ message: 'Highlight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a highlight with a note
// @route   PUT /api/highlights/:id
// @access  Private
const updateHighlightNote = async (req, res) => {
  const { note } = req.body;
  try {
    const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user._id });

    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    highlight.note = note || '';
    const updatedHighlight = await highlight.save();
    
    res.status(200).json(updatedHighlight);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating note' });
  }
};

// @desc    Search for highlights within a specific PDF
// @route   GET /api/highlights/search/:pdfId
// @access  Private
const searchHighlights = async (req, res) => {
  try {
    const { q } = req.query; // The search term
    const { pdfId } = req.params; // The PDF's UUID

    const pdf = await PDF.findOne({ uuid: pdfId, user: req.user._id });
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const searchRegex = new RegExp(q, 'i'); // Case-insensitive search

    const highlights = await Highlight.find({
      pdf: pdf._id,
      highlightText: searchRegex,
    });

    res.status(200).json(highlights);
  } catch (error) {
    res.status(500).json({ message: 'Server error while searching highlights' });
  }
};

export { createHighlight, getHighlightsByPdf, deleteHighlight, updateHighlightNote, searchHighlights };
