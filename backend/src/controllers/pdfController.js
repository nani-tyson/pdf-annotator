// src/controllers/pdfController.js (updated with all functionalities)
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import PDF from '../models/PDF.js';
// import Highlight from '../models/Highlight.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload a file stream to Cloudinary
const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    // We add resource_type: 'raw' to be explicit
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pdf-annotator', resource_type: 'raw' },
      (error, result) => {
        // THE FIX: Always check for the error object first.
        // If an error exists, reject the promise immediately.
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
// @desc    Upload a new PDF
// @route   POST /api/pdfs/upload
// @access  Private
// src/controllers/pdfController.js

// ... (top of the file) ...

const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const result = await streamUpload(req);
    const fileId = result.public_id;
    const fileVersion = result.version; // <-- ADD THIS LINE to get the version

    const pdf = await PDF.create({
      user: req.user._id,
      uuid: fileId,
      fileName: req.file.originalname,
      version: fileVersion, // <-- ADD THIS LINE to save the version
    });

    res.status(201).json({ uuid: pdf.uuid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload.' });
  }
};

// ... (rest of the file) ...
// @desc    Get all PDFs for the authenticated user
// @route   GET /api/pdfs
// @access  Private
const getPDFs = async (req, res) => {
try {
  const pdfs = await PDF.find({ user: req.user._id });
  res.status(200).json(pdfs);
} catch (error) {
  res.status(500).json({ message: 'Server error retrieving PDFs.' });
}
};

// @desc    Get a single PDF by its UUID
// @route   GET /api/pdfs/:uuid
// @access  Private
// src/controllers/pdfController.js

// ... (middle of the file) ...

const getPDFByUuid = async (req, res) => {
  try {
    const decodedUuid = decodeURIComponent(req.params.uuid);
    const pdf = await PDF.findOne({ uuid: decodedUuid, user: req.user._id });

    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // THE FIX: Add the version option to the URL generation
    const pdfUrl = cloudinary.url(pdf.uuid, {
      resource_type: 'raw',
      version: pdf.version, // <-- ADD THIS LINE
    });

    res.status(200).json({
      _id: pdf._id,
      fileName: pdf.fileName,
      uuid: pdf.uuid,
      url: pdfUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ... (rest of the file) ...

// @desc    Rename a PDF
// @route   PUT /api/pdfs/:uuid
// @access  Private
const renamePDF = async (req, res) => {
const { newName } = req.body;
try {
  // Decode the UUID from the URL before using it
  const decodedUuid = decodeURIComponent(req.params.uuid);
  const pdf = await PDF.findOne({ uuid: decodedUuid, user: req.user._id });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  }
  pdf.fileName = newName;
  await pdf.save();
  res.status(200).json({ message: 'PDF renamed successfully' });
} catch (error) {
  res.status(500).json({ message: 'Server error' });
}
};

// @desc    Search for PDFs by name
// @route   GET /api/pdfs/search
// @access  Private
const searchPDFs = async (req, res) => {
const { q } = req.query; // q is the search query from the URL
try {
  const searchRegex = new RegExp(q, 'i'); // 'i' for case-insensitive search
  const pdfs = await PDF.find({ user: req.user._id, fileName: searchRegex });
  res.status(200).json(pdfs);
} catch (error) {
  res.status(500).json({ message: 'Server error' });
}
};

// @desc    Delete a PDF
// @route   DELETE /api/pdfs/:uuid
// @access  Private
const deletePDF = async (req, res) => {
try {
  const pdf = await PDF.findOne({ uuid: req.params.uuid, user: req.user._id });
  if (!pdf) {
    return res.status(404).json({ message: 'PDF not found' });
  }
  // Delete the file from Cloudinary
  await cloudinary.uploader.destroy(pdf.uuid, { resource_type: 'raw' });
  // Delete the PDF document from MongoDB
  await pdf.deleteOne();
  res.status(200).json({ message: 'PDF deleted successfully' });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
};

// src/controllers/pdfController.js

// ... (other controller functions) ...

// @desc    Get raw asset details directly from Cloudinary for testing
// @route   GET /api/pdfs/test-cloudinary/:uuid
// @access  Private
const testCloudinary = async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.uuid);

    console.log(`Testing Cloudinary with public_id: ${publicId}`);

    // This function asks Cloudinary for all data on a specific asset
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'raw',
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    // Pass the specific error from Cloudinary back to the user
    res.status(error.http_code || 500).json({ 
        message: 'Error fetching resource from Cloudinary.',
        error: error.message 
    });
  }
};

// Make sure to add the new function to your export list
export { upload, uploadPDF, getPDFs, getPDFByUuid, renamePDF, searchPDFs, deletePDF, testCloudinary };
