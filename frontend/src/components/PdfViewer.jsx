import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPdfByUuidQuery } from '../features/pdf/pdfApi';
import {
  useGetHighlightsByPdfQuery,
  useAddHighlightMutation,
  useDeleteHighlightMutation
} from '../features/highlight/highlightApi';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'react-toastify';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75a1.25 1.25 0 00-1.25-1.25h-2.5A1.25 1.25 0 007.5 3.75v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const PdfViewer = () => {
  const { uuid } = useParams();
  const { data: pdf, isLoading: isPdfInfoLoading } = useGetPdfByUuidQuery(uuid);
  const { data: savedHighlights = [], isLoading: areHighlightsLoading } = useGetHighlightsByPdfQuery(uuid, { skip: !uuid });
  const [addHighlight] = useAddHighlightMutation();
  const [deleteHighlight] = useDeleteHighlightMutation();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(true);
  const pageContainerRef = React.useRef(null);
  
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [pendingHighlight, setPendingHighlight] = useState(null);

  const options = useMemo(() => ({ cMapUrl: '/cmaps/', cMapPacked: true }), []);

  useEffect(() => {
    if (pdf?.url) {
      setIsFileLoading(true);
      const fetchPdf = async () => {
        try {
          const response = await fetch(pdf.url);
          const fileBlob = await response.blob();
          setPdfFile(fileBlob);
        } catch (fetchError) {
          console.error("Error fetching PDF blob:", fetchError);
        } finally {
          setIsFileLoading(false);
        }
      };
      fetchPdf();
    }
  }, [pdf?.url]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handleMouseUp = (event) => {
    if (showSavePopup) {
        setShowSavePopup(false);
        setPendingHighlight(null);
        return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !pageContainerRef.current) return;
    
    const highlightText = selection.toString();
    if (highlightText.trim().length === 0) {
        selection.removeAllRanges();
        return;
    }

    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects());
    const containerRect = pageContainerRef.current.getBoundingClientRect();

    const x1 = Math.min(...rects.map(r => r.left)) - containerRect.left;
    const y1 = Math.min(...rects.map(r => r.top)) - containerRect.top;
    const x2 = Math.max(...rects.map(r => r.right)) - containerRect.left;
    const y2 = Math.max(...rects.map(r => r.bottom)) - containerRect.top;

    const position = {
      x1, y1, x2, y2,
      width: x2 - x1,
      height: y2 - y1,
    };

    setPendingHighlight({ highlightText, position, pageNumber });
    setPopupPosition({ top: event.clientY + 5, left: event.clientX });
    setShowSavePopup(true);
    
    selection.removeAllRanges();
  };

  const handleSaveHighlight = async () => {
    if (!pendingHighlight) return;
    try {
      await addHighlight({ pdfId: uuid, ...pendingHighlight }).unwrap();
      toast.success("Highlight saved!");
    } catch (err) {
      toast.error('Failed to save highlight.');
    } finally {
      setShowSavePopup(false);
      setPendingHighlight(null);
    }
  };

  const handleDeleteHighlight = async (highlightId, event) => {
    // Stop the click from propagating to the parent <li>'s onClick
    event.stopPropagation(); 
    if (window.confirm('Delete this highlight?')) {
      try {
        await deleteHighlight(highlightId).unwrap();
        toast.success('Highlight deleted.');
      } catch (err) {
        toast.error('Failed to delete highlight.');
      }
    }
  };

  const previousPage = () => setPageNumber(p => Math.max(1, p - 1));
  const nextPage = () => setPageNumber(p => Math.min(numPages, p + 1));
  
  const isLoading = isPdfInfoLoading || isFileLoading || areHighlightsLoading;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-300">
      <header className="bg-gray-800 p-3 sm:px-6 shadow-lg z-10 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
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

      {showSavePopup && (
        <div style={{ top: popupPosition.top, left: popupPosition.left }} className="fixed z-20 bg-gray-700 text-white rounded-md shadow-lg p-2 flex items-center gap-2">
          <button onClick={handleSaveHighlight} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold">Save</button>
          <button onClick={() => setShowSavePopup(false)} className="p-1 text-gray-400 hover:text-white" title="Cancel">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 max-w-sm flex-shrink-0 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Highlights</h2>
          <ul className="space-y-3">
            {savedHighlights && [...savedHighlights].sort((a, b) => a.pageNumber - b.pageNumber).map(highlight => (
              // --- THE CHANGE IS HERE ---
              // The onClick is now on the <li> and we've added hover effects
              <li 
                key={highlight._id} 
                className="p-3 bg-gray-700 rounded-lg shadow group cursor-pointer hover:bg-gray-600/50 transition-colors"
                onClick={() => setPageNumber(highlight.pageNumber)}
              >
                <blockquote className="text-sm text-gray-300 border-l-4 border-yellow-400 pl-3 italic pointer-events-none">
                  "{highlight.highlightText}"
                </blockquote>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                  <span className="font-semibold pointer-events-none">
                    Page {highlight.pageNumber}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteHighlight(highlight._id, e)}
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-600 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity"
                    title="Delete highlight"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
            {savedHighlights.length === 0 && (
              <p className="text-sm text-gray-500">No highlights yet. Select text in the document to create one.</p>
            )}
          </ul>
        </aside>

        <main className="flex-1 flex justify-center p-4 sm:p-6 overflow-auto">
          {isLoading ? (
            <div className="text-gray-400 text-xl">Loading document...</div>
          ) : (
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} options={options} className="flex flex-col items-center gap-4">
              <div ref={pageContainerRef} onMouseUp={handleMouseUp} className="relative shadow-2xl">
                <Page pageNumber={pageNumber} />
                {savedHighlights
                  .filter(h => h.pageNumber === pageNumber)
                  .map(highlight => (
                    <div
                      key={highlight._id}
                      title="Click to delete"
                      onClick={() => handleDeleteHighlight(highlight._id)}
                      className="cursor-pointer"
                      style={{
                        position: 'absolute',
                        top: `${highlight.position.y1}px`,
                        left: `${highlight.position.x1}px`,
                        width: `${highlight.position.width}px`,
                        height: `${highlight.position.height}px`,
                        backgroundColor: 'rgba(255, 255, 0, 0.4)',
                        border: '1px solid #ff0',
                      }}
                    />
                  ))}
              </div>
            </Document>
          )}
        </main>
      </div>
    </div>
  );
};

export default PdfViewer;