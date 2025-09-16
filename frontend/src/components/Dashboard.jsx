import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  useGetPdfsQuery, 
  useUploadPdfMutation,
  useDeletePdfMutation,
  useRenamePdfMutation
} from '../features/pdf/pdfApi';
import { toast } from 'react-toastify';
import { logout } from '../features/auth/authSlice';

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Dashboard = () => {
  const fileInputRef = useRef(null);
  const [newName, setNewName] = useState('');
  const [renamingUuid, setRenamingUuid] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for the search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Pass the debounced search term to the query hook
  const { data: pdfs, isLoading, isError, error } = useGetPdfsQuery(debouncedSearchTerm);
  
  const [uploadPdf, { isLoading: isUploading }] = useUploadPdfMutation();
  const [deletePdf] = useDeletePdfMutation();
  const [renamePdf, { isLoading: isRenaming }] = useRenamePdfMutation();

  // useEffect for debouncing the search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait for 500ms after the user stops typing

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    toast.info("You have been logged out.");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadPdf(file).unwrap();
        toast.success(`'${file.name}' uploaded successfully!`);
      } catch (err) {
        toast.error(err.data?.message || 'Upload failed. Please try again.');
      }
    }
    event.target.value = null;
  };
  
  const handleDelete = async (uuid) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        await deletePdf(uuid).unwrap();
        toast.success('PDF deleted successfully!');
      } catch (err) {
        toast.error(err.data?.message || 'Deletion failed. Please try again.');
      }
    }
  };

  const handleRename = async (uuid) => {
    if (!newName.trim()) {
      toast.warn('New name cannot be empty.');
      return;
    }
    try {
      await renamePdf({ uuid, newName }).unwrap();
      toast.success('PDF renamed successfully!');
      setRenamingUuid(null);
      setNewName('');
    } catch (err) {
      toast.error(err.data?.message || 'Rename failed. Please try again.');
    }
  };

  const startRenaming = (pdf) => {
    setRenamingUuid(pdf.uuid);
    setNewName(pdf.fileName);
  };
  
  const handleOpenPdf = (uuid) => {
    navigate(`/pdf/${encodeURIComponent(uuid)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-4 sm:mb-0">My Library</h1>
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:scale-100"
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
            >
              {isUploading && <SpinnerIcon />}
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search your library by filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
        </div>

        {isLoading && <div className="text-center mt-10 text-gray-400">Loading documents...</div>}
        {isError && <div className="text-center mt-10 text-red-400">Error: {error.data?.message || 'Failed to load documents'}</div>}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {pdfs && pdfs.length > 0 ? (
              pdfs.map((pdf) => (
                <div key={pdf.uuid} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md transition-all hover:bg-gray-700/50">
                  {renamingUuid === pdf.uuid ? (
                    <div className="flex w-full gap-2 items-center">
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="flex-grow p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleRename(pdf.uuid)} />
                      <button onClick={() => handleRename(pdf.uuid)} disabled={isRenaming} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:bg-green-800">Save</button>
                      <button onClick={() => setRenamingUuid(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-500">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium truncate" title={pdf.fileName}>{pdf.fileName}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <button onClick={() => handleOpenPdf(pdf.uuid)} className="px-3 py-1.5 text-blue-400 rounded-md text-sm font-medium hover:bg-gray-700">Open</button>
                        <button onClick={() => startRenaming(pdf)} className="px-3 py-1.5 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700">Rename</button>
                        <button onClick={() => handleDelete(pdf.uuid)} className="px-3 py-1.5 text-red-400 rounded-md text-sm font-medium hover:bg-gray-700">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-16">
                <h3 className="text-xl font-semibold">No PDFs Found</h3>
                <p className="mt-2">
                  {debouncedSearchTerm 
                    ? `Your search for "${debouncedSearchTerm}" did not return any results.` 
                    : "Your library is empty. Upload your first PDF!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;