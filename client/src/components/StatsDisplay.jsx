
const StatsDisplay = ({ githubData, leetcodeData }) => {
  if (!githubData && !leetcodeData) return null;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold mb-8 text-center">📊 Profile Stats</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* GitHub Stats */}
        {githubData && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-700/80 p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <img 
                src={githubData.avatar} 
                alt="avatar" 
                className="w-14 h-14 rounded-xl mr-4"
              />
              <div>
                <h3 className="text-2xl font-bold">{githubData.name || githubData.username}</h3>
                <p className="text-gray-300">@{githubData.username}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-gray-300">Public Repos</span>
                <span className="font-black text-3xl text-white">{githubData.publicRepos}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-300">Total Stars</span>
                <span className="font-black text-3xl text-yellow-400">{githubData.totalStars.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-300">Followers</span>
                <span className="font-black text-3xl text-blue-400">{githubData.followers.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">🏷️ Top Languages</h4>
              <div className="flex flex-wrap gap-2">
                {githubData.topLanguages?.slice(0, 5).map((lang, idx) => (
                  <span key={idx} className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                    {lang.language} <span className="text-gray-300">({lang.count})</span>
                  </span>
                ))}
              </div>
            </div>

            {githubData.repos?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h5 className="font-semibold mb-3">⭐ Top Repos</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {githubData.repos.slice(0, 3).map((repo, idx) => (
                    <a key={idx} href={repo.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                      <div className="font-semibold">{repo.name}</div>
                      <div className="text-sm text-gray-300">{repo.description || 'No description'}</div>
                      <div className="text-xs text-yellow-400 mt-1">⭐ {repo.stars}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LeetCode Stats */}
        {leetcodeData && (
          <div className="bg-gradient-to-br from-[#F48024]/80 to-[#EF2929]/80 p-6 rounded-xl">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mr-4">
                <span className="text-3xl font-black text-[#F48024]">LC</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{leetcodeData.username}</h3>
                <p className="text-gray-200">Competitive Programmer</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-200">Total Solved</span>
                <span className="font-black text-4xl text-white">{leetcodeData.totalSolved.toLocaleString()}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/30 p-4 rounded-xl text-center border border-green-500/50">
                  <div className="text-sm font-medium text-green-200 opacity-90">Easy</div>
                  <div className="font-black text-2xl text-green-400">{leetcodeData.easySolved}</div>
                </div>
                <div className="bg-yellow-500/30 p-4 rounded-xl text-center border border-yellow-500/50">
                  <div className="text-sm font-medium text-yellow-200 opacity-90">Medium</div>
                  <div className="font-black text-2xl text-yellow-400">{leetcodeData.mediumSolved}</div>
                </div>
                <div className="bg-red-500/30 p-4 rounded-xl text-center border border-red-500/50">
                  <div className="text-sm font-medium text-red-200 opacity-90">Hard</div>
                  <div className="font-black text-2xl text-red-400">{leetcodeData.hardSolved}</div>
                </div>
              </div>
              
              {leetcodeData.ranking && (
                <div className="bg-black/40 p-4 rounded-xl text-center">
                  <span className="text-gray-300 font-medium">Global Rank</span>
                  <div className="font-black text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    #{leetcodeData.ranking}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDisplay;
