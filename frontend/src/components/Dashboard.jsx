import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useGetPdfsQuery } from '../features/auth/authApi';
import { logout } from '../features/auth/authSlice';

const Dashboard = () => {
  const { data: pdfs, isLoading, isError } = useGetPdfsQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl font-medium text-gray-400 animate-pulse">
          Loading your library...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl font-medium text-red-500">
          Error loading PDFs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-8 flex flex-col sm:flex-row justify-between items-center bg-gray-800 shadow-lg">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          My Library
        </h1>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <span className="text-gray-400 font-medium">
            Welcome, {user?.name || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-300">Your Documents</h2>
          <button
            onClick={handleUploadClick}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            + Upload New PDF
          </button>
        </div>

        {pdfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pdfs.map((pdf) => (
              <div
                key={pdf.uuid}
                className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 transform hover:scale-105 transition duration-300"
              >
                <h3 className="text-xl font-bold text-gray-200 truncate mb-2">
                  {pdf.fileName}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Uploaded: {new Date(pdf.createdAt).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Link
                    to={`/pdf/${encodeURIComponent(pdf.uuid)}`}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-md hover:bg-purple-700 transition"
                  >
                    View
                  </Link>
                  <button className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20 bg-gray-800 rounded-lg shadow-inner">
            <p className="text-center text-gray-400 text-lg">
              You haven't uploaded any PDFs yet. Click "+ Upload New PDF" to begin!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;