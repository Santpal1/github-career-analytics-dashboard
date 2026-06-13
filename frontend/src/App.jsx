import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RepositoriesPage from './pages/RepositoriesPage';
import SkillsPage from './pages/SkillsPage';
import InsightsPage from './pages/InsightsPage';
import RecruiterReport from './pages/RecruiterReport';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand-purple selection:text-white">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard/:username" element={<Dashboard />} />
          <Route path="/dashboard/:username/repos" element={<RepositoriesPage />} />
          <Route path="/dashboard/:username/skills" element={<SkillsPage />} />
          <Route path="/dashboard/:username/insights" element={<InsightsPage />} />
          <Route path="/dashboard/:username/recruiter" element={<RecruiterReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
