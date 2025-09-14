import React, { useState } from 'react';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to log in:', err);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800 text-white transform transition-all hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold text-center text-white mb-8">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {error && (
            <p className="text-center text-red-400 text-sm mt-4">
              {error.data?.message || "Login failed."}
            </p>
          )}
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;