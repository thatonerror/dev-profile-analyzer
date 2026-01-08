import { Brain, TrendingUp, AlertCircle, Target, Award, Zap } from 'lucide-react';

export default function AIAnalysis({ analysis }) {
  if (!analysis) return null;

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'from-emerald-900/30 to-teal-900/30 border-emerald-500/30';
    if (score >= 40) return 'from-yellow-900/30 to-amber-900/30 border-yellow-500/30';
    return 'from-orange-900/30 to-red-900/30 border-orange-500/30';
  };

  // Safe access with defaults
  const overallScore = analysis.overallScore || 0;
  const scoreBreakdown = analysis.scoreBreakdown || { resume: 0, github: 0, leetcode: 0, hackerrank: 0 };
  const profileStrength = analysis.profileStrength || {};
  const technicalStrengths = analysis.technicalStrengths || [];
  const improvementAreas = analysis.improvementAreas || [];
  const careerRecommendations = analysis.careerRecommendations || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score */}
      <div className={`bg-gradient-to-br ${getScoreBg(overallScore)} backdrop-blur-xl border rounded-3xl p-6 sm:p-8`}>
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-400 flex-shrink-0" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white">AI Analysis</h3>
        </div>

        {/* Overall Score Circle */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                className={getScoreColor(overallScore)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-xl font-bold text-white mb-2">Overall Profile Score</h4>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary || 'Analysis complete'}</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400 mb-1">Resume</div>
            <div className="text-2xl font-bold text-white">{scoreBreakdown.resume || 0}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400 mb-1">GitHub</div>
            <div className="text-2xl font-bold text-white">{scoreBreakdown.github || 0}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400 mb-1">LeetCode</div>
            <div className="text-2xl font-bold text-white">{scoreBreakdown.leetcode || 0}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400 mb-1">HackerRank</div>
            <div className="text-2xl font-bold text-white">{scoreBreakdown.hackerrank || 0}</div>
          </div>
        </div>
      </div>

      {/* Profile Strength */}
      {Object.keys(profileStrength).length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-blue-400 flex-shrink-0" />
            <h4 className="text-xl font-bold text-white">Profile Strength</h4>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(profileStrength).map(([platform, data]) => {
              const platformData = data || { score: 0, status: 'Unknown' };
              return (
                <div key={platform} className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-300 capitalize">{platform}</span>
                    <span className={`text-sm font-bold ${getScoreColor(platformData.score || 0)}`}>
                      {platformData.status || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${(platformData.score || 0) >= 70 ? 'bg-emerald-400' : (platformData.score || 0) >= 40 ? 'bg-yellow-400' : 'bg-orange-400'}`}
                      style={{ width: `${platformData.score || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400">{platformData.details || `Score: ${platformData.score || 0}/100`}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Strengths */}
      {technicalStrengths.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-7 h-7 text-emerald-400 flex-shrink-0" />
            <h4 className="text-xl font-bold text-white">Technical Strengths</h4>
          </div>
          <ul className="space-y-3">
            {technicalStrengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-200">
                <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Areas */}
      {improvementAreas.length > 0 && (
        <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl border border-orange-500/30 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-7 h-7 text-orange-400 flex-shrink-0" />
            <h4 className="text-xl font-bold text-white">Areas for Improvement</h4>
          </div>
          <div className="space-y-4">
            {improvementAreas.map((item, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-orange-300">{item.area || 'General'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                    item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.priority || 'Medium'}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{item.tip || item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Recommendations */}
      {careerRecommendations.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-7 h-7 text-purple-400 flex-shrink-0" />
            <h4 className="text-xl font-bold text-white">Career Recommendations</h4>
          </div>
          <ul className="space-y-3">
            {careerRecommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-200">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-300">{index + 1}</span>
                </div>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}