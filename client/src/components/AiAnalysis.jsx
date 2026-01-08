// AIAnalysis Component
const AIAnalysis = ({ analysis }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-950/50 via-teal-950/50 to-blue-950/50 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
          <span className="text-3xl">🤖</span>
        </div>
        <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
          AI Profile Analysis
        </h2>
      </div>
      
      <div className="mb-8 p-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700">
        <h3 className="text-xl font-bold mb-4 flex items-center text-emerald-300">
          <span className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></span>
          Candidate Summary
        </h3>
        <p className="text-lg leading-relaxed text-gray-200">{analysis.summary || 'Analysis summary will appear here...'}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="p-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-6 flex items-center text-blue-300">
            <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
            💪 Technical Strengths
          </h3>
          <div className="space-y-3">
            {analysis.technicalStrengths?.length > 0 ? (
              analysis.technicalStrengths.map((strength, idx) => (
                <div key={idx} className="flex items-start p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30 hover:scale-105 transition-all">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="font-medium text-gray-200">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Strengths will appear after analysis</p>
            )}
          </div>
        </div>

        <div className="p-8 bg-gray-800/60 backdrop-blur-lg rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold mb-6 flex items-center text-orange-300">
            <span className="w-3 h-3 bg-orange-400 rounded-full mr-3"></span>
            🚀 Improvement Tips
          </h3>
          <div className="space-y-3">
            {analysis.improvementTips?.length > 0 ? (
              analysis.improvementTips.map((tip, idx) => (
                <div key={idx} className="flex items-start p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 hover:scale-105 transition-all">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <span className="font-medium text-gray-200">{tip}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Tips will appear after analysis</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center p-6 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-2xl border border-emerald-400/50 shadow-xl">
        <p className="text-xl font-bold text-emerald-300 mb-2">
          🎯 Ready for Interviews!
        </p>
        <p className="text-emerald-200">Follow the tips above to level up your profile 🚀</p>
      </div>
    </div>
  );
};
export default AIAnalysis;