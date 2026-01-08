import { useState } from 'react';
import { fetchGithubStats, fetchLeetcodeStats } from '../services/api';

const ProfileConnect = ({ setGithubData, setLeetcodeData }) => {
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [leetcodeError, setLeetcodeError] = useState('');

  const handleFetchData = async () => {
    setLoading(true);
    setGithubError('');
    setLeetcodeError('');
    
    try {
      // Fetch GitHub data
      if (githubUser.trim()) {
        const githubData = await fetchGithubStats(githubUser.trim());
        setGithubData(githubData);
      }
      
      // Fetch LeetCode data
      if (leetcodeUser.trim()) {
        const leetcodeData = await fetchLeetcodeStats(leetcodeUser.trim());
        setLeetcodeData(leetcodeData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (githubUser && !setGithubData) {
        setGithubError('GitHub user not found or API rate limited');
      }
      if (leetcodeUser && !setLeetcodeData) {
        setLeetcodeError('LeetCode stats unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold mb-6 text-center">Connect Profiles</h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* GitHub Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-[#24292F] rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.058-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.176 2.873.171 3.177.768.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-7.219-5.365-13.79-13.79-13.79z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold">GitHub</h3>
          </div>
          <input
            type="text"
            placeholder="yourusername"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
            className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {githubError && (
            <p className="text-red-400 text-sm mt-2">{githubError}</p>
          )}
        </div>

        {/* LeetCode Card */}
        <div className="bg-gradient-to-r from-[#F48024] to-[#EF2929] p-6 rounded-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-[#F48024]">LC</span>
            </div>
            <h3 className="text-xl font-semibold">LeetCode</h3>
          </div>
          <input
            type="text"
            placeholder="yourusername"
            value={leetcodeUser}
            onChange={(e) => setLeetcodeUser(e.target.value)}
            className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {leetcodeError && (
            <p className="text-red-400 text-sm mt-2">{leetcodeError}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleFetchData}
        disabled={loading || (!githubUser.trim() && !leetcodeUser.trim())}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl"
      >
        {loading ? 'Fetching...' : '🔍 Fetch Profile Data'}
      </button>
    </div>
  );
};

export default ProfileConnect;
