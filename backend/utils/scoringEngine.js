/**
 * Calculate the quality score (0-100) of a single repository.
 */
function calculateRepoQuality(repo, readmeContent = '') {
  let score = 50; // base score

  // 1. Documentation Score (Max 25 points)
  let docScore = 0;
  if (readmeContent) {
    docScore += 10; // README exists
    const len = readmeContent.length;
    if (len > 1500) docScore += 8;
    else if (len > 500) docScore += 4;
    
    // Check for sections
    const lowerReadme = readmeContent.toLowerCase();
    if (lowerReadme.includes('install') || lowerReadme.includes('setup')) docScore += 3;
    if (lowerReadme.includes('usage') || lowerReadme.includes('example')) docScore += 2;
    if (lowerReadme.includes('screenshot') || lowerReadme.includes('img') || lowerReadme.includes('png')) docScore += 2;
  }
  
  // 2. Community Activity (Max 25 points)
  const starScore = Math.min(15, (repo.stargazers_count || 0) * 3);
  const forkScore = Math.min(10, (repo.forks_count || 0) * 5);
  const communityScore = starScore + forkScore;

  // 3. Maintenance/Activity (Max 25 points)
  let maintenanceScore = 15; // default moderate maintenance
  if (repo.pushed_at) {
    const pushedDate = new Date(repo.pushed_at);
    const now = new Date();
    const daysSincePush = (now - pushedDate) / (1000 * 60 * 60 * 24);
    if (daysSincePush < 14) maintenanceScore = 25; // active
    else if (daysSincePush < 60) maintenanceScore = 20;
    else if (daysSincePush > 180) maintenanceScore = 5; // stale
  }

  // 4. Codebase Structure / Best Practices (Max 25 points)
  let structureScore = 10; // base
  if (repo.open_issues_count === 0 && (repo.stargazers_count > 0 || repo.forks_count > 0)) {
    structureScore += 5; // clean issue tracker
  }
  if (repo.has_issues) {
    structureScore += 5; // allows feedback
  }
  if (repo.homepage) {
    structureScore += 5; // has deployment demo link
  }

  score = docScore + communityScore + maintenanceScore + structureScore;
  return Math.min(100, Math.max(10, Math.round(score)));
}

/**
 * Calculate the consistency score (0-100) and streak stats from scraped heatmap calendar.
 */
function calculateConsistency(calendar) {
  if (!calendar || calendar.length === 0) {
    return {
      consistencyScore: 50,
      longestStreak: 0,
      currentStreak: 0,
      activeWeeks: 0,
      totalCommits: 0
    };
  }

  let totalCommits = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = 0;
  let activeWeeksSet = new Set();
  let gaps = 0;
  let activeInRow = 0;

  calendar.forEach((day, index) => {
    totalCommits += day.count;
    
    // Check week number to count active weeks
    const d = new Date(day.date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
    const weekKey = `${d.getFullYear()}-W${weekNumber}`;

    if (day.count > 0) {
      activeDays++;
      currentStreak++;
      activeWeeksSet.add(weekKey);
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
      if (index > 0 && calendar[index - 1].count > 0) {
        gaps++;
      }
    }
  });

  const activeWeeks = activeWeeksSet.size;
  
  // Consistency Score formula
  // Factors: active weeks ratio, longest streak, and total activity density
  const weeksRatio = Math.min(100, (activeWeeks / 52) * 100);
  const streakBonus = Math.min(25, longestStreak * 0.5);
  const densityScore = Math.min(75, (activeDays / 365) * 150);

  const consistencyScore = Math.round((weeksRatio * 0.4) + (densityScore * 0.4) + (streakBonus));
  
  return {
    consistencyScore: Math.min(100, Math.max(15, consistencyScore)),
    longestStreak,
    currentStreak,
    activeWeeks,
    totalCommits
  };
}

/**
 * Calculate Open Source Readiness score (0-100).
 */
function calculateOpenSourceReadiness(user, repos) {
  let score = 40; // base score

  // 1. Collaboration metrics
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  
  score += Math.min(20, totalForks * 4); // receives contributions/forks
  score += Math.min(10, totalStars * 0.5); // popular repos

  // 2. Open Source Activity (Own Forked Repos)
  const forkedReposCount = repos.filter(r => r.fork).length;
  score += Math.min(20, forkedReposCount * 5); // contributing to other repos by forking them

  // 3. Issue participation/community engagement
  const openIssuesCount = repos.reduce((acc, r) => acc + (r.open_issues_count || 0), 0);
  if (openIssuesCount > 5) {
    score += 10; // active issue tracker
  }

  // 4. Followers (Social interaction)
  score += Math.min(10, (user.followers || 0) * 0.5);

  return Math.min(100, Math.max(20, Math.round(score)));
}

/**
 * Infer skill distribution, languages, and detected frameworks.
 */
function detectSkills(repos) {
  const languages = {};
  const detectedFrameworks = new Set();
  
  let totalStars = 0;
  repos.forEach(repo => {
    totalStars += repo.stargazers_count || 0;
    
    // 1. Language frequencies
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
    
    // 2. Framework detection based on repo name keywords or description
    const textToSearch = `${repo.name} ${repo.description || ''}`.toLowerCase();
    
    if (textToSearch.includes('react') || textToSearch.includes('nextjs') || textToSearch.includes('next.js')) {
      detectedFrameworks.add('React');
    }
    if (textToSearch.includes('express') || textToSearch.includes('node')) {
      detectedFrameworks.add('Node.js');
    }
    if (textToSearch.includes('vue') || textToSearch.includes('nuxtjs')) {
      detectedFrameworks.add('Vue.js');
    }
    if (textToSearch.includes('django') || textToSearch.includes('flask')) {
      detectedFrameworks.add('Django/Flask');
    }
    if (textToSearch.includes('spring boot') || textToSearch.includes('springboot') || textToSearch.includes('hibernate')) {
      detectedFrameworks.add('Spring Boot');
    }
    if (textToSearch.includes('docker') || textToSearch.includes('k8s') || textToSearch.includes('kubernetes')) {
      detectedFrameworks.add('Docker');
    }
    if (textToSearch.includes('tensorflow') || textToSearch.includes('pytorch') || textToSearch.includes('machine learning') || textToSearch.includes('ml')) {
      detectedFrameworks.add('AI/ML');
    }
    if (textToSearch.includes('mysql') || textToSearch.includes('postgres') || textToSearch.includes('mongodb') || textToSearch.includes('database')) {
      detectedFrameworks.add('Databases');
    }
    if (textToSearch.includes('aws') || textToSearch.includes('gcp') || textToSearch.includes('azure') || textToSearch.includes('cloud')) {
      detectedFrameworks.add('Cloud Services');
    }
  });

  // Calculate percentages for languages
  const totalRepos = repos.length || 1;
  const langPerc = {};
  Object.keys(languages).forEach(lang => {
    langPerc[lang] = Math.round((languages[lang] / totalRepos) * 100);
  });

  // Sort languages by frequency
  const sortedLangs = Object.entries(langPerc)
    .sort((a, b) => b[1] - a[1])
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  // Generate category distributions (defaults/calculated based on language stack)
  let backend = 20;
  let frontend = 20;
  let database = 15;
  let cloud = 15;
  let aiml = 10;

  const primaryLang = Object.keys(sortedLangs)[0] || 'JavaScript';
  
  if (['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(primaryLang)) {
    frontend = 45;
    backend = 30;
    database = 15;
    cloud = 10;
  } else if (['Python', 'C++', 'Go', 'Rust'].includes(primaryLang)) {
    backend = 45;
    aiml = 25;
    cloud = 15;
    database = 15;
  } else if (['Java', 'C#'].includes(primaryLang)) {
    backend = 50;
    database = 25;
    cloud = 15;
    frontend = 10;
  }

  // Adjust based on detected frameworks
  if (detectedFrameworks.has('React') || detectedFrameworks.has('Vue.js')) {
    frontend = Math.min(60, frontend + 10);
  }
  if (detectedFrameworks.has('Docker') || detectedFrameworks.has('Cloud Services')) {
    cloud = Math.min(30, cloud + 10);
  }
  if (detectedFrameworks.has('AI/ML')) {
    aiml = Math.min(40, aiml + 15);
  }
  if (detectedFrameworks.has('Databases')) {
    database = Math.min(35, database + 10);
  }

  // Normalize to 100%
  const sum = backend + frontend + database + cloud + aiml;
  const distribution = {
    Backend: Math.round((backend / sum) * 100),
    Frontend: Math.round((frontend / sum) * 100),
    Database: Math.round((database / sum) * 100),
    Cloud: Math.round((cloud / sum) * 100),
    'AI/ML': Math.round((aiml / sum) * 100)
  };

  return {
    languages: sortedLangs,
    detectedFrameworks: Array.from(detectedFrameworks),
    distribution
  };
}

/**
 * Calculate overall Career Score based on required weighting factors.
 */
function calculateCareerScore(data) {
  const {
    avgRepoQuality = 70,
    consistencyScore = 70,
    projectDiversityCount = 2,
    totalReadmeLength = 5000,
    forkedReposCount = 0,
    collaborationStars = 0,
    technicalDepthScore = 70
  } = data;

  // 1. Repository Quality (25%)
  const repoQualityFactor = avgRepoQuality * 0.25;

  // 2. Contribution Consistency (20%)
  const consistencyFactor = consistencyScore * 0.20;

  // 3. Project Diversity (15%)
  // Score 0-100 based on diversity of projects
  const diversityScore = Math.min(100, projectDiversityCount * 35);
  const diversityFactor = diversityScore * 0.15;

  // 4. Documentation (10%)
  // Based on README length across repos
  const docScore = Math.min(100, (totalReadmeLength / 3000) * 100);
  const docFactor = docScore * 0.10;

  // 5. Open Source Activity (10%)
  // Based on forks made
  const osScore = Math.min(100, forkedReposCount * 25);
  const osFactor = osScore * 0.10;

  // 6. Collaboration (10%)
  // Based on community feedback (stars/forks received)
  const collabScore = Math.min(100, collaborationStars * 5);
  const collabFactor = collabScore * 0.10;

  // 7. Technical Depth (10%)
  // Based on config files / file types detected
  const depthFactor = technicalDepthScore * 0.10;

  const score = repoQualityFactor + consistencyFactor + diversityFactor + docFactor + osFactor + collabFactor + depthFactor;
  return Math.min(100, Math.max(10, Math.round(score)));
}

module.exports = {
  calculateRepoQuality,
  calculateConsistency,
  calculateOpenSourceReadiness,
  detectSkills,
  calculateCareerScore
};
