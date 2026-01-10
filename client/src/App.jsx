import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle, Sparkles, TrendingUp, LogOut, UserCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import ProfileConnect from './components/ProfileConnect';
import StatsDisplay from './components/StatsDisplay';
import CVUploader from './components/CVUploader';
import AIAnalysis from './components/AiAnalysis';
import ChatBot from './components/ChatBot';
import SocketTest from './components/SocketTest';
// import SocketRoom from './components/SocketRoom';
import CandidateForm from './components/CandidateForm';

// Import verification components (we'll create these next)
// Uncomment when files are created:
// import CandidateForm from './components/verification/CandidateForm';
// import ChatRoom from './components/verification/ChatRoom';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth();
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [hackerrankData, setHackerrankData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-950 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
          <div className="flex justify-between items-start mb-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <img 
                src={user?.picture} 
                alt={user?.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-purple-500"
              />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href="/verification/new"
                className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 px-4 py-2 rounded-xl transition text-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">New Verification</span>
              </a>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-4 py-2 rounded-xl transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-50 animate-pulse"></div>
                <Sparkles className="relative w-12 h-12 sm:w-16 sm:h-16 text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              Developer Profile Analyzer
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
              AI-powered professional evaluation + Real-time Background Verification
            </p>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-[90vw]">
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] xl:grid-cols-[30%_70%] gap-6 sm:gap-8 lg:gap-12">
          {/* Left Column - Inputs */}
          <div className="space-y-6 sm:space-y-8 min-w-0">
            <ProfileConnect 
              setGithubData={setGithubData}
              setLeetcodeData={setLeetcodeData}
              setHackerrankData={setHackerrankData}
            />
            <CVUploader 
              setResumeData={setResumeData}
              githubData={githubData}
              leetcodeData={leetcodeData}
              hackerrankData={hackerrankData}
              setAiAnalysis={setAiAnalysis}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6 sm:space-y-8">
            {!githubData && !leetcodeData && !hackerrankData && !resumeData && (
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center">
                <TrendingUp className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-indigo-400 opacity-50" />
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-200">Ready to Analyze</h3>
                <p className="text-slate-400 text-sm sm:text-base">Connect your profiles and upload your resume to see detailed analytics here</p>
              </div>
            )}

            <StatsDisplay 
              githubData={githubData}
              leetcodeData={leetcodeData}
              hackerrankData={hackerrankData}
            />
            
            {resumeData && !aiAnalysis && (
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold text-emerald-100">Resume Parsed</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-semibold text-emerald-300 block mb-1">Name</span>
                    <span className="text-slate-200">{resumeData.name}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-semibold text-emerald-300 block mb-1">Email</span>
                    <span className="text-slate-200 break-all">{resumeData.email}</span>
                  </div>
                  <div className="sm:col-span-2 bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-semibold text-emerald-300 block mb-2">Skills</span>
                    <span className="text-slate-200">{resumeData.skills}</span>
                  </div>
                </div>
              </div>
            )}
            
            {aiAnalysis && <AIAnalysis analysis={aiAnalysis} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/10 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl text-center text-slate-400 text-sm">
          <p>Powered by AI • Built for Developers • Real-time Verification</p>
        </div>
      </footer>

      {/* Chatbot */}
      <ChatBot 
        githubData={githubData}
        leetcodeData={leetcodeData}
        hackerrankData={hackerrankData}
        resumeData={resumeData}
        aiAnalysis={aiAnalysis}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Socket.IO Test - PUBLIC (no auth needed) */}
            <Route path="/socket-test" element={<SocketTest />} />
            
            {/* Chat Room - Public (anyone with link) */}
            {/* Uncomment when ChatRoom component is created:
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            */}
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Uncomment when CandidateForm component is created: */}
            <Route 
              path="/verification/new" 
              element={
                <ProtectedRoute>
                  <CandidateForm/>
                </ProtectedRoute>
              } 
            />
           
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;