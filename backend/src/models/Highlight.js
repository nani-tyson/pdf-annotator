// src/models/Highlight.js
import mongoose from 'mongoose';

const highlightSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PDF',
  },
  highlightText: {
    type: String,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  position: { // Store the position/bounding box data from the frontend
    type: Object,
    required: true,
  },
  note: { type: String, default: '' }, 
}, {
  timestamps: true,
});

const Highlight = mongoose.model('Highlight', highlightSchema);

export default Highlight;
