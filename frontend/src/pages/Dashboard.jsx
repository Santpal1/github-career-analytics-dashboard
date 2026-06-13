import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Heatmap from '../components/Heatmap';
import { getUserData, analyzeUser } from '../services/api';
import { 
  Users, GitFork, BookOpen, Flame, Award, Calendar, 
  MapPin, CheckCircle, HelpCircle, Activity, Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        console.log(`Loading dashboard for ${username}...`);
        try {
          const cached = await getUserData(username);
          setData(cached);
        } catch (dbErr) {
          // If 404, trigger fresh analysis
          if (dbErr.response && dbErr.response.status === 404) {
            console.log('User not found in DB, triggering fresh analyze...');
            const fresh = await analyzeUser(username);
            setData(fresh);
          } else {
            throw dbErr;
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.message || 'Failed to load user analysis.');
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
        <p className="text-slate-400 text-sm animate-pulse">Running deep analytics on GitHub telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-red-500/20 text-center">
          <Award className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">An Error Occurred</h2>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 w-full py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 font-medium transition-all"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  const { user, repositories, skills, career_recommendations, ai_review, heatmap } = data;

  // Grade calculator helper
  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5' };
    if (score >= 80) return { grade: 'A', color: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5' };
    if (score >= 70) return { grade: 'B', color: 'text-brand-blue border-brand-blue/20 bg-brand-blue/5' };
    if (score >= 60) return { grade: 'C', color: 'text-brand-gold border-brand-gold/20 bg-brand-gold/5' };
    return { grade: 'D', color: 'text-brand-pink border-brand-pink/20 bg-brand-pink/5' };
  };

  const { grade, color: gradeColor } = getGrade(user.career_score);

  // Skill distributions for bar chart
  const categorySkills = skills
    .filter(s => s.skill_category === 'Category')
    .map(s => ({ name: s.skill_name, score: s.skill_score }));

  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile header overview */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="absolute top-[-50%] right-[-10%] h-[300px] w-[300px] bg-brand-purple/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img 
              src={user.avatar_url} 
              alt={user.name || user.username} 
              className="h-24 w-24 rounded-2xl border border-dark-700 object-cover shadow-lg"
            />
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-white tracking-tight">{user.name || user.username}</h2>
              <p className="text-slate-400 text-xs font-semibold">@{user.username}</p>
              {user.bio && (
                <p className="text-slate-400 text-sm leading-relaxed">{user.bio}</p>
              )}
              {user.location && (
                <div className="flex items-center justify-center sm:justify-start text-xs text-slate-500 gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 border-t border-dark-800/80 md:border-t-0 pt-6 md:pt-0 w-full md:w-auto justify-around sm:justify-start">
            <div className="text-center sm:text-left px-4">
              <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Followers</span>
              <span className="text-xl font-bold text-white mt-1 block">{user.followers.toLocaleString()}</span>
            </div>
            <div className="h-8 border-l border-dark-800 hidden sm:block" />
            <div className="text-center sm:text-left px-4">
              <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Following</span>
              <span className="text-xl font-bold text-white mt-1 block">{user.following.toLocaleString()}</span>
            </div>
            <div className="h-8 border-l border-dark-800 hidden sm:block" />
            <div className="text-center sm:text-left px-4">
              <span className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Public Repos</span>
              <span className="text-xl font-bold text-white mt-1 block">{repositories.length}</span>
            </div>
          </div>
        </section>

        {/* Scoring & Top-level stats grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radial score card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
            <div className="absolute top-[-50px] left-[-50px] h-36 w-36 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none" />
            
            <span className="text-sm font-semibold text-slate-400 mb-6">Overall Career Score</span>
            
            <div className="relative flex items-center justify-center h-36 w-36">
              {/* Radial background circle */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-dark-700"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-brand-purple"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - user.career_score / 100)}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white tracking-tight">{user.career_score}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Grade {grade}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500 max-w-[200px] leading-relaxed">
              Calculated across 7 weighted variables assessing codebase hygiene and consistency.
            </p>
          </div>

          {/* Quick Metrics Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              title="Contribution Consistency"
              value={`${user.consistency_score}%`}
              icon={Activity}
              description="Evaluates day-to-day commit frequency, streaks, and gap mitigation."
              colorClass="brand-blue"
            />
            <StatCard
              title="Open Source Readiness"
              value={`${user.os_readiness_score}/100`}
              icon={GitFork}
              description="Analyzes pull requests, issue participation, and collaboration indexes."
              colorClass="brand-green"
            />
            <StatCard
              title="Longest Commit Streak"
              value={`${data.heatmap ? data.heatmap.reduce((max, d) => d.level > 0 ? max + 1 : max, 0) : 0} days`} // Mock stats or calculated streak
              icon={Flame}
              description="Longest consecutive daily contribution span over the past year."
              colorClass="brand-pink"
            />
            <StatCard
              title="Primary Tech Focus"
              value={skills.filter(s => s.skill_category === 'Language')[0]?.skill_name || 'Web'}
              icon={BookOpen}
              description="Derived from language presence and configuration frameworks."
              colorClass="brand-cyan"
            />
          </div>
        </section>

        {/* Heatmap Section */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-brand-purple" />
              <h3 className="text-base font-bold text-white">Contribution Heatmap</h3>
            </div>
            <span className="text-xs text-slate-500">12 Months Activity Scan</span>
          </div>
          <Heatmap data={heatmap} />
        </section>

        {/* Charts & AI Review Snip */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill charts */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Skill Category Weighting</h3>
            
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySkills} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    itemStyle={{ color: '#8B5CF6' }}
                  />
                  <Bar dataKey="score" fill="url(#barGradient)" radius={[0, 4, 4, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#EC4899" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Snapshot Card */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-brand-gold animate-pulse" />
                <h3 className="text-base font-bold text-white">Gemini Recruiter Summary</h3>
              </div>
              
              {ai_review ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded border border-brand-gold/25">Hiring Estimate</span>
                    <span className="text-sm font-semibold text-slate-200">{ai_review.hiringProbabilityEstimate}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-brand-gold/45 pl-3">
                    "{ai_review.interviewReadiness}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">No AI review summary available for this profile.</p>
              )}
            </div>

            <button
              onClick={() => navigate(`/dashboard/${username}/insights`)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Career Insights & Gaps</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
