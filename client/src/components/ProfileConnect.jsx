import { useState } from 'react';
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
      if (githubUser.trim()) {
        const data = await fetchGithubStats(githubUser.trim());
        setGithubData(data);
      }
      
      if (leetcodeUser.trim()) {
        const data = await fetchLeetcodeStats(leetcodeUser.trim());
        setLeetcodeData(data);
      }
      
      if (hackerrankUser.trim()) {
        const data = await fetchHackerrankStats(hackerrankUser.trim());
        setHackerrankData(data);
      }
    } catch (error) {
      setErrors({
        github: githubUser ? 'User not found' : '',
        leetcode: leetcodeUser ? 'Profile unavailable' : '',
        hackerrank: hackerrankUser ? 'Profile unavailable' : ''
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-100 mb-8 text-center">Connect Developer Profiles</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* GitHub */}
        <div className="group">
          <div className="flex items-center mb-4 p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3 font-bold text-sm">GH</div>
            <div>
              <h3 className="font-medium text-gray-100">GitHub</h3>
              <p className="text-sm text-gray-400">Repositories & stars</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.github && <p className="text-red-400 text-sm mt-1">{errors.github}</p>}
        </div>

        {/* LeetCode */}
        <div className="group">
          <div className="flex items-center mb-4 p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center mr-3 font-bold text-sm text-green-400">LC</div>
            <div>
              <h3 className="font-medium text-gray-100">LeetCode</h3>
              <p className="text-sm text-gray-400">Problem solving stats</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={leetcodeUser}
            onChange={(e) => setLeetcodeUser(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.leetcode && <p className="text-red-400 text-sm mt-1">{errors.leetcode}</p>}
        </div>

        {/* HackerRank */}
        <div className="group">
          <div className="flex items-center mb-4 p-4 bg-gray-800/50 rounded-xl group-hover:bg-gray-700/50 transition-all">
            <div className="w-8 h-8 bg-orange-900/50 rounded-lg flex items-center justify-center mr-3 font-bold text-sm text-orange-400">HR</div>
            <div>
              <h3 className="font-medium text-gray-100">HackerRank</h3>
              <p className="text-sm text-gray-400">Badges & challenges</p>
            </div>
          </div>
          <input
            type="text"
            placeholder="username"
            value={hackerrankUser}
            onChange={(e) => setHackerrankUser(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-400 focus:border-white/50 focus:outline-none transition-all"
          />
          {errors.hackerrank && <p className="text-red-400 text-sm mt-1">{errors.hackerrank}</p>}
        </div>
      </div>

      <button
        onClick={handleFetchData}
        disabled={loading || (!githubUser && !leetcodeUser && !hackerrankUser)}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <span>Fetch Profile Data</span>
        )}
      </button>
    </div>
  );
};

export default ProfileConnect;
