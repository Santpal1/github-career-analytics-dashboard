const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const geminiService = require('../services/geminiService');
const scoringEngine = require('../utils/scoringEngine');
const db = require('../config/db');

/**
 * POST /api/analytics/analyze
 * Trigger complete profile analysis for a GitHub username.
 */
router.post('/analyze', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'GitHub username is required.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const pool = db.getPool();

    // 1. Check database cache (if analyzed in the last 1 hour, return cached)
    const [existingUsers] = await pool.query(
      'SELECT *, UNIX_TIMESTAMP(updated_at) as updated_ts FROM users WHERE username = ?',
      [cleanUsername]
    );

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const nowTs = Math.floor(Date.now() / 1000);
      const cacheWindow = 3600; // 1 hour
      if (nowTs - user.updated_ts < cacheWindow) {
        console.log(`Cache hit for ${cleanUsername}. Returning database record.`);
        const cachedData = await fetchUserDataFromDb(user.id);
        return res.json(cachedData);
      }
    }

    console.log(`Cache miss. Performing fresh analysis for: ${cleanUsername}`);

    // 2. Fetch GitHub raw profile & repo details
    const profile = await githubService.fetchUserProfile(cleanUsername);
    const repos = await githubService.fetchUserRepositories(cleanUsername);
    const calendar = await githubService.fetchUserContributions(cleanUsername);

    // 3. Compute detailed metrics
    // Fetch readme for top 3 repositories to assess technical depth and README quality
    const topRepos = repos.slice(0, 3);
    let totalReadmeLength = 0;
    
    const reposWithScores = [];
    for (const repo of repos) {
      let readme = '';
      // Only fetch readmes for top starred repositories to stay clear of rate limits
      if (topRepos.some(tr => tr.id === repo.id)) {
        readme = await githubService.fetchReadme(cleanUsername, repo.name) || '';
        totalReadmeLength += readme.length;
      }
      
      const qualityScore = scoringEngine.calculateRepoQuality(repo, readme);
      // Activity score: Math.round(100 - days since last update)
      const daysSinceUpdate = repo.pushed_at 
        ? (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24) 
        : 365;
      const activityScore = Math.min(100, Math.max(10, Math.round(100 - daysSinceUpdate * 0.5)));

      reposWithScores.push({
        ...repo,
        qualityScore,
        activityScore,
        popularityScore: Math.min(100, (repo.stargazers_count || 0) * 10 + (repo.forks_count || 0) * 15),
        maintenanceScore: repo.pushed_at ? Math.min(100, Math.max(10, Math.round(100 - daysSinceUpdate))) : 30,
        documentationScore: readme ? Math.min(100, Math.max(20, Math.round(50 + readme.length * 0.01))) : 20
      });
    }

    // Sort repositories by quality score for response
    reposWithScores.sort((a, b) => b.qualityScore - a.qualityScore);

    const skillsData = scoringEngine.detectSkills(reposWithScores);
    const consistencyData = scoringEngine.calculateConsistency(calendar);
    const osReadiness = scoringEngine.calculateOpenSourceReadiness(profile, reposWithScores);

    // Overall Career Score
    const avgRepoQuality = reposWithScores.length > 0 
      ? reposWithScores.reduce((sum, r) => sum + r.qualityScore, 0) / reposWithScores.length 
      : 50;

    const careerScore = scoringEngine.calculateCareerScore({
      avgRepoQuality,
      consistencyScore: consistencyData.consistencyScore,
      projectDiversityCount: Object.keys(skillsData.languages).length,
      totalReadmeLength,
      forkedReposCount: repos.filter(r => r.fork).length,
      collaborationStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      technicalDepthScore: skillsData.detectedFrameworks.length > 0 ? 85 : 60
    });

    const combinedMetrics = {
      careerScore,
      consistencyScore: consistencyData.consistencyScore,
      openSourceReadiness: osReadiness,
      languages: skillsData.languages,
      detectedFrameworks: skillsData.detectedFrameworks,
      distribution: skillsData.distribution,
      streakStats: {
        longestStreak: consistencyData.longestStreak,
        currentStreak: consistencyData.currentStreak,
        activeWeeks: consistencyData.activeWeeks,
        totalCommits: consistencyData.totalCommits
      }
    };

    // 4. Generate AI Career Review from Gemini
    console.log('Generating Gemini AI career review...');
    const aiReview = await geminiService.generateCareerReview(profile, reposWithScores, combinedMetrics);

    // 5. Store / Update in MySQL database
    console.log('Storing analysis inside MySQL database...');
    
    // Insert/Update User
    const [userInsertResult] = await pool.query(
      `INSERT INTO users (github_id, username, name, avatar_url, bio, location, followers, following, career_score, consistency_score, os_readiness_score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       name = VALUES(name), avatar_url = VALUES(avatar_url), bio = VALUES(bio), location = VALUES(location), 
       followers = VALUES(followers), following = VALUES(following), career_score = VALUES(career_score), 
       consistency_score = VALUES(consistency_score), os_readiness_score = VALUES(os_readiness_score), updated_at = CURRENT_TIMESTAMP`,
      [
        profile.id.toString(),
        cleanUsername,
        profile.name,
        profile.avatar_url,
        profile.bio,
        profile.location,
        profile.followers,
        profile.following,
        careerScore,
        consistencyData.consistencyScore,
        osReadiness
      ]
    );

    // Fetch the updated user ID
    const [userRows] = await pool.query('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    const userId = userRows[0].id;

    // Clear and Save Repositories
    await pool.query('DELETE FROM repositories WHERE user_id = ?', [userId]);
    for (const r of reposWithScores) {
      await pool.query(
        `INSERT INTO repositories (user_id, repo_name, description, language, stars, forks, open_issues, quality_score, activity_score, popularity_score, maintenance_score, documentation_score, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          r.name,
          r.description,
          r.language,
          r.stargazers_count,
          r.forks_count,
          r.open_issues_count,
          r.qualityScore,
          r.activityScore,
          r.popularityScore,
          r.maintenanceScore,
          r.documentationScore,
          r.created_at,
          r.updated_at
        ]
      );
    }

    // Clear and Save Skills
    await pool.query('DELETE FROM skills WHERE user_id = ?', [userId]);
    // Save Language distributions
    for (const [skill, score] of Object.entries(skillsData.languages)) {
      await pool.query(
        'INSERT INTO skills (user_id, skill_name, skill_category, skill_score) VALUES (?, ?, ?, ?)',
        [userId, skill, 'Language', score]
      );
    }
    // Save Framework distributions
    for (const [category, score] of Object.entries(skillsData.distribution)) {
      await pool.query(
        'INSERT INTO skills (user_id, skill_name, skill_category, skill_score) VALUES (?, ?, ?, ?)',
        [userId, category, 'Category', score]
      );
    }

    // Clear and Save Career Recommendations
    await pool.query('DELETE FROM career_recommendations WHERE user_id = ?', [userId]);
    
    // Auto-calculate suggested roles based on skill distribution
    const roles = [];
    const dist = skillsData.distribution;
    if (dist.Backend > 30) roles.push({ role: 'Backend Engineer', confidence: dist.Backend + 10 });
    if (dist.Frontend > 30) roles.push({ role: 'Frontend Engineer', confidence: dist.Frontend + 15 });
    if (dist.Frontend >= 20 && dist.Backend >= 20) roles.push({ role: 'Full Stack Engineer', confidence: Math.round((dist.Frontend + dist.Backend) / 2) + 15 });
    if (dist.Cloud > 20) roles.push({ role: 'DevOps Engineer', confidence: dist.Cloud + 25 });
    if (dist['AI/ML'] > 20) roles.push({ role: 'AI/ML Engineer', confidence: dist['AI/ML'] + 20 });
    if (dist.Database > 20) roles.push({ role: 'Data Engineer', confidence: dist.Database + 20 });
    
    // Sort roles by confidence
    roles.sort((a, b) => b.confidence - a.confidence);
    
    // Default fallback role if nothing matches
    if (roles.length === 0) {
      roles.push({ role: 'Software Engineer', confidence: 75 });
    }

    for (const r of roles) {
      await pool.query(
        'INSERT INTO career_recommendations (user_id, role, confidence) VALUES (?, ?, ?)',
        [userId, r.role, r.confidence]
      );
    }

    // Clear and Save AI Reviews
    await pool.query('DELETE FROM ai_reviews WHERE user_id = ?', [userId]);
    await pool.query(
      'INSERT INTO ai_reviews (user_id, review_text) VALUES (?, ?)',
      [userId, JSON.stringify(aiReview)]
    );

    // 6. Return compile response
    const completeData = {
      user: {
        id: userId,
        github_id: profile.id.toString(),
        username: cleanUsername,
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        followers: profile.followers,
        following: profile.following,
        career_score: careerScore,
        consistency_score: consistencyData.consistencyScore,
        os_readiness_score: osReadiness
      },
      repositories: reposWithScores.map(r => ({
        repo_name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        open_issues: r.open_issues_count,
        quality_score: r.qualityScore,
        activity_score: r.activityScore,
        popularity_score: r.popularityScore,
        maintenance_score: r.maintenanceScore,
        documentation_score: r.documentationScore,
        created_at: r.created_at,
        updated_at: r.updated_at
      })),
      skills: [
        ...Object.entries(skillsData.languages).map(([name, score]) => ({ skill_name: name, skill_category: 'Language', skill_score: score })),
        ...Object.entries(skillsData.distribution).map(([name, score]) => ({ skill_name: name, skill_category: 'Category', skill_score: score }))
      ],
      career_recommendations: roles,
      ai_review: aiReview,
      heatmap: calendar
    };

    console.log(`Fresh analysis for ${cleanUsername} complete.`);
    res.json(completeData);

  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/analytics/user/:username
 * Fetch existing analysis from database if available.
 */
router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  const cleanUsername = username.trim().toLowerCase();

  try {
    const pool = db.getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [cleanUsername]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User analysis not found.' });
    }

    const userData = await fetchUserDataFromDb(users[0].id);
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Helper to fetch complete dashboard data from DB.
 */
async function fetchUserDataFromDb(userId) {
  const pool = db.getPool();

  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
  const [repos] = await pool.query('SELECT * FROM repositories WHERE user_id = ?', [userId]);
  const [skills] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
  const [recs] = await pool.query('SELECT * FROM career_recommendations WHERE user_id = ?', [userId]);
  const [reviews] = await pool.query('SELECT * FROM ai_reviews WHERE user_id = ?', [userId]);

  // Generate mock calendar for frontend display as calendar days are not fully stored in DB (saves storage)
  // The client also has fallback generation if heatmap is empty
  const calendar = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    // We generate a deterministic layout based on user id and date so it renders identically
    const charCodeSum = dateString.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const hash = (userId * charCodeSum) % 100;
    let level = 0;
    let count = 0;
    if (hash > 75) {
      level = (hash % 4) + 1;
      count = level === 1 ? 1 : level === 2 ? 3 : level === 3 ? 6 : 12;
    }
    calendar.push({ date: dateString, level, count });
  }

  const reviewText = reviews.length > 0 ? JSON.parse(reviews[0].review_text) : null;

  return {
    user: users[0],
    repositories: repos,
    skills,
    career_recommendations: recs,
    ai_review: reviewText,
    heatmap: calendar
  };
}

module.exports = router;
