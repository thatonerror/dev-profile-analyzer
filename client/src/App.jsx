import { useState } from 'react';
import ProfileConnect from './components/ProfileConnect';
import StatsDisplay from './components/StatsDisplay';
import CVUploader from './components/CVUploader';
import AIAnalysis from './components/AiAnalysis';

function App() {
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [hackerrankData, setHackerrankData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-200 to-gray-100 bg-clip-text text-transparent mb-6">
            Developer Profile Analyzer
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Professional analysis of GitHub, LeetCode, HackerRank profiles and resume parsing with AI insights
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Inputs */}
          <div className="space-y-12">
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

          {/* Right - Results */}
          <div className="space-y-12">
            <StatsDisplay 
              githubData={githubData}
              leetcodeData={leetcodeData}
              hackerrankData={hackerrankData}
            />
            {aiAnalysis && <AIAnalysis analysis={aiAnalysis} />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>Built with Node.js • React • Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
}

export default App;
