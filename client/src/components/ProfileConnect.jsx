import { useState } from 'react';

import { Github, Code2, Award, Loader2 } from 'lucide-react';
import { fetchGithubStats, fetchLeetcodeStats, fetchHackerrankStats } from '../services/api';
// ProfileConnect Component
const ProfileConnect = ({ setGithubData, setLeetcodeData, setHackerrankData }) => {
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [hackerrankUser, setHackerrankUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFetchData = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const promises = [];
      
      if (githubUser.trim()) {
        promises.push(
          fetch(`http://localhost:5000/api/github/${githubUser.trim()}`)
            .then(res => res.json())
            .then(data => {
              console.log('✅ GitHub data:', data);
              setGithubData(data);
            })
            .catch(err => {
              console.error('❌ GitHub error:', err);
              setErrors(prev => ({ ...prev, github: 'User not found' }));
            })
        );
      }
      
      if (leetcodeUser.trim()) {
        promises.push(
          fetch(`http://localhost:5000/api/leetcode/${leetcodeUser.trim()}`)
            .then(res => res.json())
            .then(data => {
              console.log('✅ LeetCode data:', data);
              setLeetcodeData(data);
            })
            .catch(err => {
              console.error('❌ LeetCode error:', err);
              setErrors(prev => ({ ...prev, leetcode: 'Profile unavailable' }));
            })
        );
      }
      
      if (hackerrankUser.trim()) {
        promises.push(
          fetch(`http://localhost:5000/api/hackerrank/${hackerrankUser.trim()}`)
            .then(res => res.json())
            .then(data => {
              console.log('✅ HackerRank data:', data);
              setHackerrankData(data);
            })
            .catch(err => {
              console.error('❌ HackerRank error:', err);
              setErrors(prev => ({ ...prev, hackerrank: 'Profile unavailable' }));
            })
        );
      }
      
      await Promise.allSettled(promises);
      console.log('✅ All profiles fetched');
      
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-indigo-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Connect Profiles
      </h2>
      
      <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
        {/* GitHub */}
        <div className="group">
          <label className="flex items-center gap-3 mb-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group-hover:border-slate-600 transition-all">
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-base sm:text-lg">GitHub</div>
              <div className="text-xs sm:text-sm text-slate-400">Repositories & contributions</div>
            </div>
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
          {errors.github && <p className="text-red-400 text-sm mt-2">{errors.github}</p>}
        </div>

        {/* LeetCode */}
        <div className="group">
          <label className="flex items-center gap-3 mb-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group-hover:border-slate-600 transition-all">
            <div className="w-10 h-10 bg-orange-950 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-orange-400 font-bold text-lg">LC</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-base sm:text-lg">LeetCode</div>
              <div className="text-xs sm:text-sm text-slate-400">Problem solving statistics</div>
            </div>
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={leetcodeUser}
            onChange={(e) => setLeetcodeUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
          />
          {errors.leetcode && <p className="text-red-400 text-sm mt-2">{errors.leetcode}</p>}
        </div>

        {/* HackerRank */}
        <div className="group">
          <label className="flex items-center gap-3 mb-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group-hover:border-slate-600 transition-all">
            <div className="w-10 h-10 bg-green-950 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-green-400 font-bold text-lg">HR</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-base sm:text-lg">HackerRank</div>
              <div className="text-xs sm:text-sm text-slate-400">Challenges & certifications</div>
            </div>
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={hackerrankUser}
            onChange={(e) => setHackerrankUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
          />
          {errors.hackerrank && <p className="text-red-400 text-sm mt-2">{errors.hackerrank}</p>}
        </div>
      </div>

      <button
        onClick={handleFetchData}
        disabled={loading || (!githubUser && !leetcodeUser && !hackerrankUser)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
            Fetching...
          </span>
        ) : (
          'Fetch Profile Data'
        )}
      </button>
    </div>
  );
};


export default ProfileConnect;