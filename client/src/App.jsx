import { useState } from 'react';
import ProfileConnect from './components/ProfileConnect';
import StatsDisplay from './components/StatsDisplay';
import CVUploader from './components/CVUploader';
import AIAnalysis from './components/AiAnalysis';

function App() {
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl mb-6">
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DevProfile AI
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect your GitHub, LeetCode profiles + upload resume. Get instant AI-powered career insights.
          </p>
        </div>
        
        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column - Inputs */}
          <div className="space-y-10">
            <ProfileConnect 
              setGithubData={setGithubData}
              setLeetcodeData={setLeetcodeData}
              loading={loading}
              setLoading={setLoading}
            />
            <CVUploader 
              setResumeData={setResumeData}
              githubData={githubData}
              leetcodeData={leetcodeData}
              setAiAnalysis={setAiAnalysis}
              setLoading={setLoading}
            />
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-10">
            <StatsDisplay 
              githubData={githubData}
              leetcodeData={leetcodeData}
            />
            
            {/* AI Analysis */}
            {aiAnalysis && (
              <AIAnalysis analysis={aiAnalysis} />
            )}
            
            {/* Resume parsed but no AI */}
            {resumeData && !aiAnalysis && (
              <div className="glass p-12 rounded-3xl text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl mx-auto flex items-center justify-center mb-6">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Resume Parsed!</h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Add GitHub/LeetCode profiles above for complete AI analysis 🚀
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div><span className="font-semibold">Name:</span> {resumeData.name}</div>
                  <div><span className="font-semibold">Email:</span> {resumeData.email}</div>
                  {resumeData.skills !== 'Skills not extracted' && (
                    <div><span className="font-semibold">Skills:</span> {resumeData.skills}</div>
                  )}
                </div>
              </div>
            )}
            
            {/* No Data State */}
            {!githubData && !leetcodeData && !resumeData && !aiAnalysis && (
              <div className="glass p-12 rounded-3xl text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-3xl mx-auto flex items-center justify-center mb-6">
                  <span className="text-4xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-4">Get Started</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Enter your GitHub/LeetCode usernames and upload resume to get AI insights
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto opacity-60">
                  <div className="p-4 bg-blue-500/20 rounded-2xl">🐙 GitHub Stats</div>
                  <div className="p-4 bg-orange-500/20 rounded-2xl">📊 LeetCode</div>
                  <div className="p-4 bg-green-500/20 rounded-2xl">📄 Resume Parse</div>
                  <div className="p-4 bg-purple-500/20 rounded-2xl">🤖 AI Analysis</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-12 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>Powered by GitHub API • LeetCode Stats • Google Gemini AI</p>
          <p className="mt-2">Built for developers by developers 🚀</p>
        </div>
      </div>
    </div>
  );
}

export default App;
