import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserData } from '../services/api';
import { Cpu, Award, Zap, Code, ShieldCheck } from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart as ReRadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';

function SkillsPage() {
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
        setError('Failed to load skills page.');
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
        <p className="text-slate-400 text-sm">Mapping technology distribution vectors...</p>
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

  const { skills, repositories } = data;

  // Filter skills by category
  const languageSkills = skills
    .filter(s => s.skill_category === 'Language')
    .map(s => ({ name: s.skill_name, value: s.skill_score }));

  const categorySkills = skills
    .filter(s => s.skill_category === 'Category')
    .map(s => ({ subject: s.skill_name, A: s.skill_score, fullMark: 100 }));

  // Frameworks list: find any technologies detected in the analysis
  const detectedFrameworks = Array.from(
    new Set(
      repositories
        .map(r => {
          const nameLower = r.repo_name.toLowerCase();
          const descLower = (r.description || '').toLowerCase();
          const list = [];
          if (nameLower.includes('react') || descLower.includes('react')) list.push('React');
          if (nameLower.includes('node') || descLower.includes('node')) list.push('Node.js');
          if (nameLower.includes('express') || descLower.includes('express')) list.push('Express');
          if (nameLower.includes('next') || descLower.includes('next')) list.push('Next.js');
          if (nameLower.includes('django') || descLower.includes('django')) list.push('Django');
          if (nameLower.includes('flask') || descLower.includes('flask')) list.push('Flask');
          if (nameLower.includes('spring') || descLower.includes('spring')) list.push('Spring Boot');
          if (nameLower.includes('docker') || descLower.includes('docker')) list.push('Docker');
          if (nameLower.includes('kubernetes') || descLower.includes('kubernetes') || nameLower.includes('k8s')) list.push('Kubernetes');
          if (nameLower.includes('postgres') || descLower.includes('postgres')) list.push('PostgreSQL');
          if (nameLower.includes('mysql') || descLower.includes('mysql')) list.push('MySQL');
          if (nameLower.includes('mongodb') || descLower.includes('mongodb')) list.push('MongoDB');
          return list;
        })
        .flat()
    )
  );

  // Growth Timeline: Group repositories by year created
  const timelineData = {};
  repositories.forEach(repo => {
    if (repo.created_at) {
      // created_at can be full ISO string (e.g. 2023-05-15T12:00:00Z) or raw year
      const year = new Date(repo.created_at).getFullYear();
      if (!isNaN(year)) {
        if (!timelineData[year]) {
          timelineData[year] = [];
        }
        timelineData[year].push(repo);
      }
    }
  });

  const sortedTimelineYears = Object.keys(timelineData).sort((a, b) => a - b);

  return (
    <div className="flex flex-col min-h-screen bg-dark-950">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title */}
        <div className="flex items-center space-x-3 border-b border-dark-800/80 pb-6">
          <Cpu className="h-6 w-6 text-brand-purple" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Skills & Tech Stack</h2>
            <p className="text-xs text-slate-500 mt-1">Language distributions, frameworks, and skills development over time.</p>
          </div>
        </div>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart (Recharts) */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Engineering Focus Radar</h3>
            <div className="h-64 flex items-center justify-center">
              {categorySkills.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ReRadarChart cx="50%" cy="50%" outerRadius="80%" data={categorySkills}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                    <Radar name={username} dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </ReRadarChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-500">Not enough data to map radar chart.</span>
              )}
            </div>
          </div>

          {/* Languages Bar Chart */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Programming Language Share (%)</h3>
            <div className="h-64">
              {languageSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageSkills} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1e293b', borderRadius: '8px' }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      itemStyle={{ color: '#EC4899' }}
                    />
                    <Bar dataKey="value" fill="url(#purpleGradient)" radius={[6, 6, 0, 0]}>
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-500">No language data found.</span>
              )}
            </div>
          </div>
        </section>

        {/* Detected Frameworks & Tech */}
        <section className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-cyan" />
            <span>Detected Frameworks & Infrastructure</span>
          </h3>
          
          <div className="flex flex-wrap gap-2.5">
            {detectedFrameworks.length > 0 ? (
              detectedFrameworks.map((fw, idx) => (
                <span 
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-dark-900 border border-dark-800 text-slate-200 shadow-sm flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-brand-cyan" />
                  {fw}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No complex framework configuration files detected in repositories. Defaulting to programming languages stack.</span>
            )}
          </div>
        </section>

        {/* Growth Timeline */}
        <section className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Code className="h-5 w-5 text-brand-pink" />
            <span>Developer Growth Timeline</span>
          </h3>

          <div className="relative border-l-2 border-dark-800 ml-4 space-y-8 py-4">
            {sortedTimelineYears.map((year, yIdx) => {
              const repos = timelineData[year];
              const yearLangs = Array.from(new Set(repos.map(r => r.language).filter(Boolean)));
              return (
                <div key={yIdx} className="relative pl-8 animate-slide-up" style={{ animationDelay: `${yIdx * 150}ms` }}>
                  {/* Glowing timeline dot */}
                  <div className="absolute left-[-9px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-dark-950 bg-brand-pink glow-border-purple shadow-sm shadow-brand-pink/50" />
                  
                  <div className="space-y-2">
                    <span className="text-lg font-bold text-white tracking-tight">{year}</span>
                    
                    {/* Year tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {yearLangs.map((l, i) => (
                        <span key={i} className="text-[10px] bg-dark-800 border border-dark-700 text-slate-400 px-2 py-0.5 rounded-md">
                          {l}
                        </span>
                      ))}
                    </div>

                    {/* Repos list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {repos.slice(0, 3).map((repo, rIdx) => (
                        <div key={rIdx} className="bg-dark-900/60 p-4 rounded-xl border border-dark-800/80 space-y-1.5">
                          <span className="text-xs font-bold text-slate-200 block">{repo.repo_name}</span>
                          {repo.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{repo.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedTimelineYears.length === 0 && (
              <p className="text-xs text-slate-500 italic pl-8">No repository history available to build timeline.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default SkillsPage;
