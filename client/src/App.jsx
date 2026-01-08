import { useState } from 'react';
import { CheckCircle } from 'lucide-react'; // ADD THIS IMPORT
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
              Developer Profile Analyzer
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Professional evaluation of GitHub, LeetCode, HackerRank profiles + AI-powered resume analysis
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Inputs */}
          <div className="lg:sticky lg:top-8 lg:h-screen lg:overflow-y-auto space-y-8">
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
          <div className="space-y-8">
            <StatsDisplay 
              githubData={githubData}
              leetcodeData={leetcodeData}
              hackerrankData={hackerrankData}
            />
            
            {resumeData && !aiAnalysis && (
              <div className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <CheckCircle className="w-8 h-8 mr-3 text-green-400" />
                  Resume Parsed Successfully
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold">Name:</span> {resumeData.name}</div>
                  <div><span className="font-semibold">Email:</span> {resumeData.email}</div>
                  <div className="md:col-span-2"><span className="font-semibold">Skills:</span> {resumeData.skills}</div>
                </div>
              </div>
            )}
            
            {aiAnalysis && <AIAnalysis analysis={aiAnalysis} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;