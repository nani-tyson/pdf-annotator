// src/models/PDF.js
import mongoose from 'mongoose';

const pdfSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // This links the PDF to a specific user
  },
  uuid: { // A unique identifier for the PDF
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const PDF = mongoose.model('PDF', pdfSchema);

export default PDF;
