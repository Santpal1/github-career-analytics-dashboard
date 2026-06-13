import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserData } from '../services/api';
import { 
  Search, Star, GitFork, AlertCircle, BookOpen, 
  Settings2, Activity, Calendar, FileText, ArrowUpDown 
} from 'lucide-react';

function RepositoriesPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search, sorting and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('quality_score');
  const [filterLang, setFilterLang] = useState('All');
  
  // Modal detail repository state
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const cached = await getUserData(username);
        setData(cached);
      } catch (err) {
        setError('Failed to load repositories.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Evaluating repository codebase patterns...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl bg-dark-800 text-white border border-dark-700">Back</button>
      </div>
    );
  }

  const { repositories } = data;

  // Filter languages selector list
  const uniqueLangs = ['All', ...new Set(repositories.map(r => r.language).filter(Boolean))];

  // Perform filtering & sorting
  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.repo_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLang = filterLang === 'All' || repo.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const sortedRepos = [...filteredRepos].sort((a, b) => {
    if (sortBy === 'quality_score') return b.quality_score - a.quality_score;
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'forks') return b.forks - a.forks;
    if (sortBy === 'name') return a.repo_name.localeCompare(b.repo_name);
    return 0;
  });

  // Calculate detailed project quality insights for modal
  const getRepoDetails = (repo) => {
    const strengths = [];
    const weaknesses = [];
    const suggestions = [];

    // Documentation
    if (repo.documentation_score > 70) {
      strengths.push("Excellent documentation with a highly detailed README.");
    } else {
      weaknesses.push("Repository lacks comprehensive README documentation.");
      suggestions.push("Write a structured README covering installation, execution flags, and architecture.");
    }

    // Popularity / Community
    if (repo.stars > 5 || repo.forks > 3) {
      strengths.push(`Community interest is verified with ${repo.stars} stars and ${repo.forks} forks.`);
    } else {
      weaknesses.push("Limited community interaction (few stars or forks).");
      suggestions.push("Share your project in developer forums or tag it with relevant GitHub topic tags.");
    }

    // Maintenance
    if (repo.maintenance_score > 80) {
      strengths.push("Highly active repository with frequent commits and updates.");
    } else if (repo.maintenance_score < 40) {
      weaknesses.push("Repository is currently stale with no recent pushes.");
      suggestions.push("Make updates, resolve open issues, or refactor stale folders.");
    }

    // Clean issues
    if (repo.open_issues === 0) {
      strengths.push("Good codebase maintenance showing no unresolved open issues.");
    } else {
      weaknesses.push(`Currently contains ${repo.open_issues} open issues.`);
      suggestions.push("Review and close open issues or fix reported bugs.");
    }

    return { strengths, weaknesses, suggestions };
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-800/80 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Repository Analytics</h2>
            <p className="text-xs text-slate-500 mt-1">Deep analysis of repository structures and documentation metrics.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple">
            {repositories.length} Total Repositories
          </span>
        </div>

        {/* Toolbar: Search, Filter & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-dark-900/40 p-4 rounded-2xl border border-dark-800/80">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-sm placeholder-slate-500 focus:outline-none focus:border-brand-purple transition-all"
            />
          </div>

          {/* Filter Language */}
          <div className="relative">
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-sm text-slate-300 focus:outline-none focus:border-brand-purple cursor-pointer appearance-none"
            >
              {uniqueLangs.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Settings2 className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-sm text-slate-300 focus:outline-none focus:border-brand-purple cursor-pointer appearance-none"
            >
              <option value="quality_score">Sort by Quality Score</option>
              <option value="stars">Sort by Stars</option>
              <option value="forks">Sort by Forks</option>
              <option value="name">Sort by Name</option>
            </select>
            <ArrowUpDown className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Repositories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRepos.map((repo, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedRepo(repo)}
              className="glass-card p-6 rounded-2xl cursor-pointer hover:border-brand-purple/30 group transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {repo.language && (
                    <span className="text-[10px] font-semibold bg-dark-800 text-slate-300 border border-dark-700 px-2 py-0.5 rounded-md">
                      {repo.language}
                    </span>
                  )}
                  {/* Quality rating badge */}
                  <div className="flex items-center space-x-1.5 bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Quality</span>
                    <span className="text-xs font-bold text-brand-purple">{repo.quality_score}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-purple transition-colors duration-200">
                  {repo.repo_name}
                </h3>

                {repo.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {repo.description}
                  </p>
                )}
              </div>

              {/* Sub-ratings indicators */}
              <div className="border-t border-dark-800/80 pt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-brand-gold" />
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5 text-slate-500" />
                    {repo.forks}
                  </span>
                </div>
                
                <span className="text-brand-purple hover:underline hover:text-brand-pink transition-colors">
                  Review Quality Details →
                </span>
              </div>
            </div>
          ))}

          {sortedRepos.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No repositories matched your filters. Try adjusting your search query.
            </div>
          )}
        </div>
      </main>

      {/* Repository Details Modal */}
      {selectedRepo && (() => {
        const details = getRepoDetails(selectedRepo);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-xl w-full border-brand-purple/20 shadow-2xl relative space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-dark-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedRepo.repo_name}</h3>
                  <span className="text-[10px] font-semibold text-slate-500">Quality Analysis Rating: {selectedRepo.quality_score}/100</span>
                </div>
                <button 
                  onClick={() => setSelectedRepo(null)}
                  className="p-1 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white transition-all text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Quality sub-scores gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-dark-900/50 border border-dark-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Popularity</span>
                  <span className="text-base font-bold text-white mt-1 block">{selectedRepo.popularity_score}</span>
                </div>
                <div className="bg-dark-900/50 border border-dark-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Activity</span>
                  <span className="text-base font-bold text-white mt-1 block">{selectedRepo.activity_score}</span>
                </div>
                <div className="bg-dark-900/50 border border-dark-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Maintenance</span>
                  <span className="text-base font-bold text-white mt-1 block">{selectedRepo.maintenance_score}</span>
                </div>
                <div className="bg-dark-900/50 border border-dark-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Readme</span>
                  <span className="text-base font-bold text-white mt-1 block">{selectedRepo.documentation_score}</span>
                </div>
              </div>

              {/* Strengths, Weaknesses, Suggestions */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {/* Strengths */}
                {details.strengths.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-brand-green uppercase">Strengths</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {details.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {details.weaknesses.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-brand-pink uppercase">Weaknesses</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {details.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {details.suggestions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-brand-blue uppercase">Improvement Suggestions</span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {details.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Button */}
              <button
                onClick={() => setSelectedRepo(null)}
                className="w-full py-2.5 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all"
              >
                Close Review Card
              </button>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default RepositoriesPage;
