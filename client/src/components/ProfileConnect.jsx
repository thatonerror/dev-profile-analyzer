import { useState } from 'react';

// ProfileConnect Component
const ProfileConnect = ({
  setGithubData,
  setLeetcodeData,
  setHackerrankData
}) => {
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

      // -------- GitHub --------
      if (githubUser.trim()) {
        promises.push(
          fetch(`${import.meta.env.VITE_API_URL}/github/${githubUser.trim()}`)
            .then(async res => {
              if (!res.ok) {
                const err = await res.json();

                // 🔥 RATE LIMIT HANDLING
                if (res.status === 429) {
                  throw new Error(
                    'GitHub rate limit exceeded. Please wait a few minutes and try again.'
                  );
                }

                throw new Error(err.error || 'GitHub fetch failed');
              }
              return res.json();
            })
            .then(data => {
              console.log('✅ GitHub data:', data);
              setGithubData(data);
            })
            .catch(err => {
              console.error('❌ GitHub error:', err.message);
              setErrors(prev => ({
                ...prev,
                github: err.message
              }));
            })
        );
      }

      // -------- LeetCode --------
      if (leetcodeUser.trim()) {
        promises.push(
          fetch(`${import.meta.env.VITE_API_URL}/leetcode/${leetcodeUser.trim()}`)
            .then(async res => {
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'LeetCode fetch failed');
              }
              return res.json();
            })
            .then(data => {
              console.log('✅ LeetCode data:', data);
              setLeetcodeData(data);
            })
            .catch(err => {
              console.error('❌ LeetCode error:', err.message);
              setErrors(prev => ({
                ...prev,
                leetcode: err.message
              }));
            })
        );
      }

      // -------- HackerRank --------
      if (hackerrankUser.trim()) {
        promises.push(
          fetch(`${import.meta.env.VITE_API_URL}/hackerrank/${hackerrankUser.trim()}`)
            .then(async res => {
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'HackerRank fetch failed');
              }
              return res.json();
            })
            .then(data => {
              console.log('✅ HackerRank data:', data);
              setHackerrankData(data);
            })
            .catch(err => {
              console.error('❌ HackerRank error:', err.message);
              setErrors(prev => ({
                ...prev,
                hackerrank: err.message
              }));
            })
        );
      }

      await Promise.allSettled(promises);
      console.log('✅ All profiles fetched');
    } catch (error) {
      console.error('❌ Unexpected error:', error);
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
        <div>
          <label className="block mb-3 font-semibold text-slate-200">
            GitHub Username
          </label>
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={githubUser}
            onChange={e => setGithubUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          {errors.github && (
            <p className="text-red-400 text-sm mt-2">{errors.github}</p>
          )}
        </div>

        {/* LeetCode */}
        <div>
          <label className="block mb-3 font-semibold text-slate-200">
            LeetCode Username
          </label>
          <input
            type="text"
            placeholder="Enter LeetCode username"
            value={leetcodeUser}
            onChange={e => setLeetcodeUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
          />
          {errors.leetcode && (
            <p className="text-red-400 text-sm mt-2">{errors.leetcode}</p>
          )}
        </div>

        {/* HackerRank */}
        <div>
          <label className="block mb-3 font-semibold text-slate-200">
            HackerRank Username
          </label>
          <input
            type="text"
            placeholder="Enter HackerRank username"
            value={hackerrankUser}
            onChange={e => setHackerrankUser(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
          />
          {errors.hackerrank && (
            <p className="text-red-400 text-sm mt-2">{errors.hackerrank}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleFetchData}
        disabled={loading || (!githubUser && !leetcodeUser && !hackerrankUser)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 px-6 rounded-2xl font-bold text-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Profile Data'}
      </button>
    </div>
  );
};

export default ProfileConnect;