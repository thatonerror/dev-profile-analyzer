import { useState } from 'react';
import { Github, Code2, Award, Loader2 } from 'lucide-react';
import { fetchGithubStats, fetchLeetcodeStats, fetchHackerrankStats } from '../services/api';

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
          fetchGithubStats(githubUser.trim())
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
          fetchLeetcodeStats(leetcodeUser.trim())
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
          fetchHackerrankStats(hackerrankUser.trim())
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-6 sm:mb-8 text-center">
        Connect Developer Profiles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* GitHub */}
        <div className="group">
          <div className="flex items-center mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-100 text-sm sm:text-base">GitHub</h3>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Repositories & stars</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
            className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.github && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.github}</p>}
        </div>

        {/* LeetCode */}
        <div className="group">
          <div className="flex items-center mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Code2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-100 text-sm sm:text-base">LeetCode</h3>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Problem solving stats</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={leetcodeUser}
            onChange={(e) => setLeetcodeUser(e.target.value)}
            className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.leetcode && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.leetcode}</p>}
        </div>

        {/* HackerRank */}
        <div className="group">
          <div className="flex items-center mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Award className="w-4 h-4 text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-100 text-sm sm:text-base">HackerRank</h3>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Badges & challenges</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={hackerrankUser}
            onChange={(e) => setHackerrankUser(e.target.value)}
            className="w-full p-3 sm:p-4 bg-white/10 border border-white/20 rounded-xl text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.hackerrank && <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.hackerrank}</p>}
        </div>
      </div>

      <button
        onClick={handleFetchData}
        disabled={loading || (!githubUser && !leetcodeUser && !hackerrankUser)}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span>Fetch Profile Data</span>
        )}
      </button>
    </div>
  );
};

export default ProfileConnect;