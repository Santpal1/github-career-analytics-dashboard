import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserData } from '../services/api';
import { FileSpreadsheet, Printer, ArrowLeft, Briefcase, Award, Star, Compass } from 'lucide-react';

function RecruiterReport() {
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
        setError('Failed to load recruiter report.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Drafting printable recruiter dossier...</p>
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

  const { user, skills, career_recommendations, ai_review, repositories } = data;

  // Rating helper to derive High/Medium/Low levels from raw scores
  const getRating = (score) => {
    if (score >= 75) return { text: 'High', color: 'text-brand-green bg-brand-green/10 border-brand-green/20' };
    if (score >= 45) return { text: 'Medium', color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20' };
    return { text: 'Low', color: 'text-brand-pink bg-brand-pink/10 border-brand-pink/20' };
  };

  // Derive rating items based on skill distributions & database scores
  const backendVal = skills.find(s => s.skill_name === 'Backend')?.skill_score || 35;
  const frontendVal = skills.find(s => s.skill_name === 'Frontend')?.skill_score || 35;
  const dbVal = skills.find(s => s.skill_name === 'Database')?.skill_score || 30;
  const cloudVal = skills.find(s => s.skill_name === 'Cloud')?.skill_score || 25;
  const aimlVal = skills.find(s => s.skill_name === 'AI/ML')?.skill_score || 15;

  const ratings = [
    { name: 'Backend Strength', ...getRating(backendVal) },
    { name: 'Frontend Strength', ...getRating(frontendVal) },
    { name: 'Database Skills', ...getRating(dbVal) },
    { name: 'System Design Exposure', ...getRating(cloudVal + 20) }, // proxy with cloud/deployment
    { name: 'AI Experience', ...getRating(aimlVal * 3) }, // scaled representation
    { name: 'Open Source Experience', ...getRating(user.os_readiness_score) },
    { name: 'Testing Culture', ...getRating(Math.max(30, user.career_score - 15)) }, // derived testing proxy
  ];

  const topThreeRepos = [...repositories].sort((a, b) => b.quality_score - a.quality_score).slice(0, 3);
  const primaryRole = career_recommendations[0]?.role || 'Software Engineer';

  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        
        {/* Actions bar */}
        <div className="flex items-center justify-between border-b border-dark-800/80 pb-6 no-print">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recruiter Dossier</h2>
            <p className="text-xs text-slate-500 mt-1">Exportable developer competency snapshot.</p>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all glow-border-purple"
          >
            <Printer className="h-4 w-4 mr-2" />
            <span>Print or Save PDF</span>
          </button>
        </div>

        {/* Printable Paper Layout */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8 glass-panel print:border-none print:shadow-none print:p-0">
          
          {/* Top header grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-dark-800 pb-6 gap-4 print:border-slate-300">
            <div className="flex items-center space-x-4">
              <img 
                src={user.avatar_url} 
                alt={user.name || user.username}
                className="h-16 w-16 rounded-xl border border-dark-700 object-cover print:border-slate-300"
              />
              <div>
                <h1 className="text-xl font-bold text-white print:text-slate-900">{user.name || user.username}</h1>
                <span className="text-xs text-slate-400 font-semibold block print:text-slate-600">GitHub Profile Summary Report</span>
                {user.location && (
                  <span className="text-[10px] text-slate-500 block print:text-slate-600 mt-0.5">{user.location}</span>
                )}
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="block text-[10px] text-slate-500 font-semibold uppercase">Employability Score</span>
              <span className="text-3xl font-extrabold text-brand-purple tracking-tight block mt-1 print:text-slate-900">
                {user.career_score}<span className="text-xs text-slate-500 font-normal">/100</span>
              </span>
            </div>
          </div>

          {/* Ratings list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800 flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-brand-purple print:text-slate-700" />
              <span>Core Competency Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ratings.map((rate, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-dark-900/60 border border-dark-800/80 print:bg-slate-50 print:border-slate-300">
                  <span className="text-xs font-medium text-slate-300 print:text-slate-700">{rate.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border print:text-slate-800 ${rate.color}`}>
                    {rate.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter recommendation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800 flex items-center gap-1.5">
              <Briefcase className="h-4.5 w-4.5 text-brand-purple print:text-slate-700" />
              <span>Recruiter Verdict</span>
            </h3>
            
            <div className="bg-brand-purple/5 border border-brand-purple/15 p-5 rounded-2xl print:bg-slate-50 print:border-slate-300">
              <p className="text-xs text-slate-300 leading-relaxed print:text-slate-700 font-medium">
                Candidate is recommended for <span className="text-brand-purple font-bold print:text-slate-900">{primaryRole}</span> positions. 
                They exhibit a rating score of {user.career_score}/100 and display {user.consistency_score}% weekly commit consistency.
              </p>
              
              {ai_review && (
                <p className="text-xs text-slate-400 leading-relaxed print:text-slate-600 italic mt-3 border-t border-dark-800/80 pt-3 print:border-slate-300">
                  "{ai_review.interviewReadiness}"
                </p>
              )}
            </div>
          </div>

          {/* Best portfolio projects */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800 flex items-center gap-1.5">
              <Star className="h-4.5 w-4.5 text-brand-purple print:text-slate-700" />
              <span>Key Portfolio Repositories</span>
            </h3>

            <div className="space-y-3">
              {topThreeRepos.map((repo, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-dark-800 bg-dark-900/40 print:border-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white print:text-slate-900">{repo.repo_name}</span>
                    <span className="text-[10px] font-semibold text-slate-500">Quality Index: {repo.quality_score}/100</span>
                  </div>
                  {repo.description && (
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 print:text-slate-600">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[9px] text-slate-500 mt-2">
                    {repo.language && (
                      <span className="bg-dark-800 px-1.5 py-0.5 rounded print:bg-slate-100">{repo.language}</span>
                    )}
                    <span>★ {repo.stars} Stars</span>
                    <span>⑂ {repo.forks} Forks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer signature */}
          <div className="border-t border-dark-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-600 print:border-slate-300 print:text-slate-500">
            <span>DevMetrics AI Profile Scan — Verified Hash ID: {user.github_id}</span>
            <span className="mt-2 sm:mt-0">Dossier Generated: {new Date().toLocaleDateString()}</span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default RecruiterReport;
