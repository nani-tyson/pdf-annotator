import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetPdfByUuidQuery } from '../features/pdf/pdfApi';
import {
  useGetHighlightsByPdfQuery,
  useAddHighlightMutation,
  useUpdateHighlightNoteMutation,
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

  const [annotationSearch, setAnnotationSearch] = useState('');
  const [debouncedAnnotationSearch, setDebouncedAnnotationSearch] = useState('');
  
  const { data: savedHighlights = [], isLoading: areHighlightsLoading } = useGetHighlightsByPdfQuery(
    { pdfId: uuid, searchTerm: debouncedAnnotationSearch },
    { skip: !uuid }
  );

  const [addHighlight] = useAddHighlightMutation();
  const [deleteHighlight] = useDeleteHighlightMutation();
  const [updateHighlightNote] = useUpdateHighlightNoteMutation();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(true);
  const pageContainerRef = React.useRef(null);
  
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [pendingHighlight, setPendingHighlight] = useState(null);
  
  const [editingHighlightId, setEditingHighlightId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const options = useMemo(() => ({ cMapUrl: '/cmaps/', cMapPacked: true }), []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedAnnotationSearch(annotationSearch);
    }, 500);
    return () => clearTimeout(timerId);
  }, [annotationSearch]);

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
    if (showSavePopup || editingHighlightId) {
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

    const position = { x1, y1, x2, y2, width: x2 - x1, height: y2 - y1 };

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

  const handleEditNoteClick = (highlight) => {
    setEditingHighlightId(highlight._id);
    setNoteText(highlight.note || '');
  };

  const handleSaveNote = async (highlightId) => {
    try {
      await updateHighlightNote({ id: highlightId, note: noteText }).unwrap();
      toast.success("Note saved!");
      setEditingHighlightId(null);
    } catch (err) {
      toast.error("Failed to save note.");
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
        <aside className="w-1/4 max-w-sm flex-shrink-0 bg-gray-800 p-4 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4">Highlights</h2>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search highlights..."
              value={annotationSearch}
              onChange={(e) => setAnnotationSearch(e.target.value)}
              className="w-full p-2 text-sm bg-gray-700 text-gray-200 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <ul className="space-y-3 flex-1 overflow-y-auto">
            {savedHighlights && [...savedHighlights].sort((a, b) => a.pageNumber - b.pageNumber).map(highlight => (
              <li key={highlight._id} className="relative p-3 bg-gray-700 rounded-lg shadow group">
                <div 
                  className="cursor-pointer" 
                  onClick={() => setPageNumber(highlight.pageNumber)}
                >
                  <blockquote className="text-sm text-gray-300 border-l-4 border-yellow-400 pl-3 italic pointer-events-none">
                    "{highlight.highlightText}"
                  </blockquote>
                  <div className="text-xs text-gray-400 mt-2 font-semibold pointer-events-none">
                    Page {highlight.pageNumber}
                  </div>
                </div>

                <div className="mt-3">
                  {editingHighlightId === highlight._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        className="w-full p-2 text-sm bg-gray-800 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingHighlightId(null)} className="px-3 py-1 text-xs rounded-md hover:bg-gray-600">Cancel</button>
                        <button onClick={() => handleSaveNote(highlight._id)} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded-md">Save Note</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {highlight.note ? (
                        <div
                          onClick={() => handleEditNoteClick(highlight)}
                          className="p-2 rounded-md cursor-pointer hover:bg-gray-600/50"
                          title="Click to edit note"
                        >
                          <p className="text-sm text-gray-200 whitespace-pre-wrap">{highlight.note}</p>
                        </div>
                      ) : (
                        <button onClick={() => handleEditNoteClick(highlight)} className="text-xs text-blue-400 hover:underline">
                          Add Note
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => handleDeleteHighlight(highlight._id, e)}
                  className="absolute top-2 right-2 p-1 rounded-full text-gray-500 hover:bg-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete highlight"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
            {savedHighlights.length === 0 && (
              <p className="text-sm text-gray-500">
                {debouncedAnnotationSearch
                  ? `No highlights found for "${debouncedAnnotationSearch}".`
                  : "No highlights yet. Select text to create one."
                }
              </p>
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
                      title={highlight.note || "Click to delete"}
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