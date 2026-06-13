import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Code2, Compass, Cpu, FileSpreadsheet, Github, Sparkles, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { analyzeUser, loginMock } from '../services/api';

function LandingPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`Analyzing: ${username}`);
      await analyzeUser(username.trim());
      navigate(`/dashboard/${username.trim()}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please verify the GitHub username.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    const demoUser = 'gaearon'; // Dan Abramov
    try {
      await analyzeUser(demoUser);
      // Mock login for demo context
      await loginMock('demo_recruiter', 'recruiter');
      navigate(`/dashboard/${demoUser}`);
    } catch (err) {
      setError('Failed to load demo profile.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: 'GitHub Profile Analysis',
      description: 'Fetch bio, followers, repository metrics, and full commit histories in a single scan.',
      icon: Github,
      color: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
    },
    {
      title: 'Skill Detection Engine',
      description: 'Scans source files and configurations to automatically map backend, frontend, database, and cloud expertise.',
      icon: Cpu,
      color: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20'
    },
    {
      title: 'Career Score Rating',
      description: 'Computes a comprehensive employability rating from 0-100 based on repository standards, streaks, and complexity.',
      icon: TrendingUp,
      color: 'text-brand-pink bg-brand-pink/10 border-brand-pink/20'
    },
    {
      title: 'Project Quality Analyzer',
      description: 'Evaluates codebase structure, README installation steps, and code hygiene for every repository.',
      icon: Code2,
      color: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
    },
    {
      title: 'Recruiter Snapshots',
      description: 'Generates a clean, exportable one-page summary highlighting technical strengths for hiring managers.',
      icon: FileSpreadsheet,
      color: 'text-brand-green bg-brand-green/10 border-brand-green/20'
    },
    {
      title: 'AI Career Reviews',
      description: 'Sends computed telemetry data to Google Gemini to formulate structured weaknesses, gaps, and resume improvements.',
      icon: Sparkles,
      color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center relative px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] bg-brand-purple/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] bg-brand-pink/5 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Core Branding Panel */}
      <div className="max-w-4xl w-full text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-semibold mb-6 animate-pulse-slow">
          <Sparkles className="h-4.5 w-4.5" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          The <span className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-blue bg-clip-text text-transparent">Fitbit</span> for Software Developers.
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-400">
          Analyze your GitHub profile instantly. Uncover recruiter-friendly summaries, technical skill ratings, project diagnostics, and customized AI career recommendations.
        </p>

        {/* Input box form */}
        <div className="mt-10 max-w-md mx-auto">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username (e.g. gaearon)"
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-xl bg-dark-900 border border-dark-800 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/50 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold hover:opacity-95 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center whitespace-nowrap glow-border-purple"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick links & Demo buttons */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDemo}
              disabled={loading}
              className="text-xs text-brand-purple font-medium hover:underline hover:text-brand-pink transition-colors duration-150 py-1"
            >
              🚀 View standard recruiter demo profile (gaearon)
            </button>
          </div>

          {/* Error boundary alert */}
          {error && (
            <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-start text-left gap-3 animate-fade-in">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Feature grid showcase */}
      <div className="max-w-7xl w-full mt-24 relative z-10">
        <div className="border-t border-dark-800/80 my-12" />
        <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-200 mb-10">
          Features designed to accelerate employability
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl group transition-all duration-300">
                <div className={`p-3 rounded-xl border w-fit ${feature.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white group-hover:text-brand-purple transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-24 text-center text-[10px] text-slate-600 border-t border-dark-900 pt-6">
        <span>© {new Date().getFullYear()} DevMetrics AI. Acts as portfolio showcase demonstration. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default LandingPage;
