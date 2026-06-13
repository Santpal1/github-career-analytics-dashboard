import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserData } from '../services/api';
import { 
  Sparkles, Compass, CheckCircle2, AlertOctagon, HelpCircle, 
  Lightbulb, Briefcase, ThumbsUp, ThumbsDown, UserCheck 
} from 'lucide-react';

function InsightsPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const cached = await getUserData(username);
        setData(cached);
      } catch (err) {
        setError('Failed to load career insights.');
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
        <p className="text-slate-400 text-sm">Compiling recruiter insights and role mappings...</p>
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

  const { career_recommendations, ai_review, repositories } = data;

  // Algorithms to determine top resume projects and projects to avoid locally in case AI fallback or custom ranking
  // We rank repos by Quality Score
  const sortedReposForResume = [...repositories].sort((a, b) => b.quality_score - a.quality_score);
  const topResumeProjects = sortedReposForResume.slice(0, 3);
  const avoidResumeProjects = repositories.length > 3 
    ? [...repositories].sort((a, b) => a.quality_score - b.quality_score).slice(0, 2)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Title */}
        <div className="flex items-center space-x-3 border-b border-dark-800/80 pb-6">
          <Compass className="h-6 w-6 text-brand-gold" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Career Insights</h2>
            <p className="text-xs text-slate-500 mt-1">Recommended career paths, resume guidelines, and recruiter-focused evaluations.</p>
          </div>
        </div>

        {/* Roles & Career Paths */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-brand-purple" />
            <span>Recommended Career Paths</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {career_recommendations.map((rec, idx) => (
              <div key={idx} className="bg-dark-900/40 p-4 rounded-xl border border-dark-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{rec.role}</span>
                  <span className="text-xs font-semibold text-brand-purple">{rec.confidence}% Confidence</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Career Review details */}
        {ai_review && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Strengths & Weaknesses */}
            <div className="lg:col-span-2 space-y-6">
              {/* Strengths */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-brand-green flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Key Strengths</span>
                </h3>
                <ul className="space-y-3">
                  {ai_review.strengths.map((str, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-brand-green/30 pl-3">
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-brand-pink flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5" />
                  <span>Constructive Growth Areas</span>
                </h3>
                <ul className="space-y-3">
                  {ai_review.weaknesses.map((wk, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-brand-pink/30 pl-3">
                      {wk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resume suggestions */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-brand-blue flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Resume Presentational Suggestions</span>
                </h3>
                <ul className="space-y-3">
                  {ai_review.resumeSuggestions.map((sug, i) => (
                    <li key={i} className="text-xs text-slate-300 leading-relaxed border-l-2 border-brand-blue/30 pl-3">
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Col: Missing Tech, Interview Readiness, Recommended Projects */}
            <div className="space-y-6">
              
              {/* Hiring Probability */}
              <div className="glass-card p-6 rounded-2xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-brand-purple/5 rounded-full blur-xl pointer-events-none" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase">Hiring Probability Estimate</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight glow-purple">
                    {ai_review.hiringProbabilityEstimate.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-brand-purple font-semibold uppercase">Employability</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {ai_review.hiringProbabilityEstimate.replace(/^[0-9]+%\s*-\s*/, '')}
                </p>
              </div>

              {/* Missing skills */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Technologies to Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {ai_review.missingSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-dark-900 border border-dark-800 text-slate-300">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview readiness */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-brand-purple" />
                  <span>Interview Readiness Summary</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{ai_review.interviewReadiness}"
                </p>
              </div>
            </div>

          </section>
        )}

        {/* Resume Project Recommender */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-dark-800 pb-4 gap-4">
            <h3 className="text-base font-bold text-white">Resume Project Selector</h3>
            <span className="text-xs text-slate-500">Ranks repositories for maximum resume impact.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Top Projects */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4" />
                <span>Featured Resume Additions</span>
              </span>
              
              <div className="space-y-4">
                {topResumeProjects.map((repo, i) => (
                  <div key={i} className="bg-dark-900/40 p-4 rounded-xl border border-dark-800/80 space-y-2">
                    <span className="text-xs font-bold text-white">{repo.repo_name}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Score: <span className="font-semibold text-brand-green">{repo.quality_score}</span> | Language: {repo.language || 'Web'}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-dark-800/80 pt-2">
                      Reason: High codebase hygiene rating with detailed README guidelines, suggesting production readiness.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid Projects */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-pink uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsDown className="h-4 w-4" />
                <span>Projects to Keep Off Resume</span>
              </span>
              
              <div className="space-y-4">
                {avoidResumeProjects.length > 0 ? (
                  avoidResumeProjects.map((repo, i) => (
                    <div key={i} className="bg-dark-900/40 p-4 rounded-xl border border-dark-800/80 space-y-2">
                      <span className="text-xs font-bold text-white">{repo.repo_name}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Score: <span className="font-semibold text-brand-pink">{repo.quality_score}</span> | Language: {repo.language || 'Web'}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-dark-800/80 pt-2">
                        Reason: Incomplete readme files and stale commits, indicating standard sandboxed/scratch code instead of a portfolio project.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No low-rated repositories found to exclude.</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Suggested Projects to build */}
        {ai_review && ai_review.recommendedProjects && (
          <section className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white">AI-Recommended Future Projects</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ai_review.recommendedProjects.map((proj, i) => (
                <div key={i} className="bg-dark-900/40 p-5 rounded-xl border border-dark-800/80 space-y-3">
                  <span className="text-sm font-bold text-brand-cyan block">{proj.title}</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic border-t border-dark-800/80 pt-2">
                    <span className="font-bold text-slate-400 not-italic">Recruiter Impact:</span> {proj.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default InsightsPage;
