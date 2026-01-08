/* ---------- Small helpers ---------- */

const StatRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span
      className={`text-xl font-bold ${
        highlight ? 'text-yellow-400' : 'text-gray-100'
      }`}
    >
      {(value ?? 0).toLocaleString()}
    </span>
  </div>
);

const PlatformCard = ({ title, label, children }) => (
  <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl hover:shadow-xl transition-all">
    <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
    <p className="text-gray-400 text-sm mb-4">{label}</p>
    {children}
  </div>
);

const BigStat = ({ label, value }) => (
  <div className="text-center p-4 bg-gray-700 rounded-xl mb-4">
    <div className="text-3xl font-bold text-gray-100">
      {(value ?? 0).toLocaleString()}
    </div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
);

const ThreeStats = ({ a, b, c }) => (
  <div className="grid grid-cols-3 gap-3">
    <MiniStat label="Easy" value={a} color="green" />
    <MiniStat label="Medium" value={b} color="yellow" />
    <MiniStat label="Hard" value={c} color="red" />
  </div>
);

const MiniStat = ({ label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-900/30 border-green-900/50 text-green-400',
    yellow: 'bg-yellow-900/30 border-yellow-900/50 text-yellow-400',
    red: 'bg-red-900/30 border-red-900/50 text-red-400'
  };
  
  return (
    <div className={`p-3 ${colorClasses[color]} border rounded-lg text-center`}>
      <div className={`text-xl font-bold text-${color}-400`}>
        {value ?? 0}
      </div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
};

// StatsDisplay Component
const StatsDisplay = ({ githubData, leetcodeData, hackerrankData }) => {
  if (!githubData && !leetcodeData && !hackerrankData) return null;

  return (
        <div className="min-w-0">

    <div className="bg-gradient-to-br from-slate-900/80 to-blue-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Profile Analytics
      </h2>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">        {/* ---------------- GitHub ---------------- */}
        {githubData && (
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:scale-105 transition-transform">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={githubData.avatar}
                alt="avatar"
                className="w-12 h-12 rounded-xl"
              />
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
              <StatRow label="Repos" value={githubData.publicRepos} />
              <StatRow label="Stars" value={githubData.totalStars} highlight />
              <StatRow label="Followers" value={githubData.followers} />
            </div>

            {githubData.topLanguages?.length > 0 && (
              <div className="pt-3 sm:pt-4 border-t border-gray-700">
                <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3 text-gray-300">
                  Top Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {githubData.topLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-700 text-xs rounded-full border border-gray-600 text-gray-200"
                    >
                      {lang.language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* GitHub Repositories inside the card */}
            {githubData.repos?.length > 0 && (
              <div className="pt-4 border-t border-gray-700 mt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Top Repositories
                </h4>
                <div className="space-y-2">
                  {githubData.repos.slice(0, 4).map(repo => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition group"
                    >
                      <div className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                        {repo.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ⭐ {repo.stars} {repo.language && `• ${repo.language}`}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- LeetCode ---------------- */}
        {leetcodeData && (
          <PlatformCard title={leetcodeData.username} label="LeetCode">
            <BigStat label="Solved" value={leetcodeData.totalSolved} />
            <ThreeStats
              a={leetcodeData.easySolved}
              b={leetcodeData.mediumSolved}
              c={leetcodeData.hardSolved}
            />
          </PlatformCard>
        )}

        {/* ---------------- HackerRank ---------------- */}
        {hackerrankData && (
          <PlatformCard title={hackerrankData.username} label="HackerRank">
            <div className="space-y-3">
              <StatRow label="Challenges" value={hackerrankData.challengesSolved} />
              <StatRow label="Badges" value={hackerrankData.totalBadges} />
              <StatRow label="Stars" value={hackerrankData.totalStars} />
            </div>
          </PlatformCard>
        )}
      </div>
    </div>
    </div>
  );
};

export default StatsDisplay;