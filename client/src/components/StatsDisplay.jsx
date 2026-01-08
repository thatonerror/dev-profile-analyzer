// StatsDisplay Component
const StatsDisplay = ({ githubData, leetcodeData, hackerrankData }) => {
  if (!githubData && !leetcodeData && !hackerrankData) return null;

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 text-gray-100">
        Profile Analytics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {githubData && (
          <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-all">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-950 rounded-xl flex items-center justify-center mr-3 sm:mr-4 font-bold text-xs sm:text-sm text-white flex-shrink-0">
                GH
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate text-gray-100">
                  {githubData.name || githubData.username}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm truncate">
                  @{githubData.username}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Repos</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-100">{githubData.publicRepos}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Stars</span>
                <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {githubData.totalStars.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Followers</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-100">
                  {githubData.followers.toLocaleString()}
                </span>
              </div>
            </div>

            {githubData.topLanguages?.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 text-gray-300">
                  Top Languages
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {githubData.topLanguages.slice(0, 4).map((lang, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 sm:px-3 py-1 bg-gray-700 text-xs rounded-full border border-gray-600 text-gray-200"
                    >
                      {lang.language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {leetcodeData && (
          <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-all">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-950 rounded-xl flex items-center justify-center mr-3 sm:mr-4 font-bold text-xs sm:text-sm text-green-400 flex-shrink-0">
                LC
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate text-gray-100">
                  {leetcodeData.username}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Competitive Programming</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="text-center p-3 sm:p-4 bg-gray-700 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold text-gray-100">
                  {leetcodeData.totalSolved.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Total Solved</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-green-900/30 border border-green-900/50 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-green-400">
                  {leetcodeData.easySolved}
                </div>
                <div className="text-xs text-gray-400">Easy</div>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-900/30 border border-yellow-900/50 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-400">
                  {leetcodeData.mediumSolved}
                </div>
                <div className="text-xs text-gray-400">Medium</div>
              </div>
              <div className="p-2 sm:p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-center">
                <div className="text-lg sm:text-xl font-bold text-red-400">
                  {leetcodeData.hardSolved}
                </div>
                <div className="text-xs text-gray-400">Hard</div>
              </div>
            </div>
          </div>
        )}

        {hackerrankData && (
          <div className="bg-gray-800 border border-gray-700 p-4 sm:p-6 rounded-xl hover:shadow-xl transition-all md:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-950 rounded-xl flex items-center justify-center mr-3 sm:mr-4 font-bold text-xs sm:text-sm text-orange-400 flex-shrink-0">
                HR
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold truncate text-gray-100">
                  {hackerrankData.username}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">Coding Platform</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Challenges</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-100">
                  {hackerrankData.challengesSolved?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Badges</span>
                <span className="text-xl sm:text-2xl font-bold text-orange-400">
                  {hackerrankData.totalBadges || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs sm:text-sm">Stars</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-100">
                  {hackerrankData.totalStars?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {hackerrankData.badges?.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 text-gray-300">
                  Top Badges
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {hackerrankData.badges.slice(0, 6).map((badge, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-gray-700 text-xs rounded-full border border-gray-600 truncate max-w-[80px] sm:max-w-[100px] text-gray-200"
                      title={badge}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default StatsDisplay;