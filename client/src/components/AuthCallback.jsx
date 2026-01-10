import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false); // Prevent multiple executions

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasProcessed.current) {
      console.log('⏭️ Already processed, skipping...');
      return;
    }

    console.log('🔵 AuthCallback mounted');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Location search:', location.search);
    
    // Extract token from URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    console.log('🔑 Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('❌ Error param:', errorParam);

    // Handle error
    if (errorParam) {
      const errorMsg = errorMessage 
        ? decodeURIComponent(errorMessage)
        : errorParam.replace(/_/g, ' ');
      
      console.error('❌ Authentication error:', errorMsg);
      setError(errorMsg);
      hasProcessed.current = true;
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return;
    }

    // Handle no token
    if (!token) {
      console.error('❌ No token received in callback');
      setError('No authentication token received');
      hasProcessed.current = true;
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
      return;
    }

    // Process token - ONLY ONCE
    try {
      console.log('✅ Saving token and redirecting...');
      hasProcessed.current = true; // Mark as processed BEFORE login
      
      login(token);
      
      // Redirect to dashboard WITHOUT query params
      console.log('🔄 Navigating to /dashboard');
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      console.error('❌ Error processing token:', err);
      setError('Failed to process authentication');
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    }
  }, []); // Empty dependency array - run only once!

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-slate-400">Please wait while we log you in</p>
      </div>
    </div>
  );
}