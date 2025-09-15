import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPdfByUuidQuery } from '../features/pdf/pdfApi';
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const PdfViewer = () => {
  const { uuid } = useParams();
  const { data: pdf, isLoading, isError, error } = useGetPdfByUuidQuery(uuid);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  // Define the options for the Document component
  const options = {
    cMapUrl: '/cmaps/', // <-- THE FIX: Point to the local cmaps folder
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // ... (rest of the functions are the same)
  const previousPage = () => setPageNumber(p => p - 1);
  const nextPage = () => setPageNumber(p => p + 1);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-400 text-xl">Loading document...</div>;
  }
  
  if (isError) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400 text-xl">Error: {error.data?.message || 'Failed to load PDF.'}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-300">
      <header className="bg-gray-800 p-3 sm:px-6 shadow-lg z-10 sticky top-0 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Header content is the same */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">&larr; Back to Library</Link>
          <h3 className="text-lg font-semibold text-white truncate">{pdf?.fileName}</h3>
        </div>
        {numPages && (
          <div className="flex items-center gap-4">
            <button type="button" disabled={pageNumber <= 1} onClick={previousPage} className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 transition-colors hover:enabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-sm text-gray-400 font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <button type="button" disabled={pageNumber >= numPages} onClick={nextPage} className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 transition-colors hover:enabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-grow flex justify-center p-4 sm:p-6 overflow-auto">
        <Document
          file={pdf?.url}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options} // <-- Use the options object we defined
          className="flex flex-col items-center gap-4"
        >
          <Page pageNumber={pageNumber} className="shadow-2xl" />
        </Document>
      </main>
    </div>
  );
};

export default PdfViewer;