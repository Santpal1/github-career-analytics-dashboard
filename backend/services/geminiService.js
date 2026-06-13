const axios = require('axios');
require('dotenv').config();

// Default fallback API key if not specified in .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyBqL0ua2KAAHXD7SOn5W7UgRMp1mVzyaUM';
const MODEL = 'gemini-2.5-flash';

async function generateCareerReview(userData, reposData, metrics) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
You are an expert technical recruiter and senior software engineering manager.
Analyze the following developer profile and repository metrics to generate a professional, recruiter-focused career assessment.

--- DEVELOPER PROFILE ---
Username: ${userData.username}
Name: ${userData.name || 'N/A'}
Bio: ${userData.bio || 'N/A'}
Location: ${userData.location || 'N/A'}
Followers: ${userData.followers} | Following: ${userData.following}
Career Score: ${metrics.careerScore}/100
Consistency Score: ${metrics.consistencyScore}/100
Open Source Readiness: ${metrics.openSourceReadiness}/100

--- DETECTED SKILLS ---
Languages: ${JSON.stringify(metrics.languages)}
Frameworks & Tech: ${JSON.stringify(metrics.detectedFrameworks)}

--- TOP REPOSITORIES ---
${reposData.slice(0, 10).map(r => `- ${r.name}: ${r.language || 'N/A'}, Stars: ${r.stargazers_count}, Forks: ${r.forks_count}, Open Issues: ${r.open_issues_count}, Quality Score: ${r.qualityScore}/100\n  Description: ${r.description || 'No description'}`).join('\n')}

--- SYSTEM DESIGN & COMPLEXITY DETECTED ---
Project Diversity: ${metrics.projectDiversity}
Total Public Repos: ${userData.public_repos}

--- TASK ---
Provide a recruiter-oriented assessment in JSON format.
Your output must be a single, valid JSON object ONLY. Do not include markdown code block formatting (such as \`\`\`json ... \`\`\`).
The JSON object must have exactly the following structure:
{
  "strengths": ["list of 3 key technical/engineering strengths"],
  "weaknesses": ["list of 3 constructive technical/engineering weaknesses or growth areas"],
  "missingSkills": ["list of 3 highly-demanded technologies, languages, or tools that would complement their current stack"],
  "recommendedProjects": [
    {
      "title": "Title of a recommended project to build",
      "description": "Short description of what the project is",
      "reason": "Why this project is highly relevant for their career gap and resume"
    },
    {
      "title": "Title of a second recommended project to build",
      "description": "Short description",
      "reason": "Why it helps"
    }
  ],
  "interviewReadiness": "A short summary (2-3 sentences) evaluating their readiness for software engineering interviews, specifically highlighting DSA vs system design exposure based on their profile",
  "resumeSuggestions": ["list of 3 specific recommendations on how to present their projects, code layout, or GitHub profile on a resume"],
  "hiringProbabilityEstimate": "A percentage string (e.g. '82%') representing their employability for junior-to-mid level roles in their main domain, along with a 1-sentence explanation"
}
`;

    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const text = response.data.candidates[0].content.parts[0].text;
    
    // Clean text of any accidental code blocks if the model ignored responseMimeType
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error('Gemini API review generation failed, using fallback generator:', err.message);
    return generateFallbackReview(userData, reposData, metrics);
  }
}

/**
 * Generate a highly customized and realistic mock review if the Gemini API is unreachable or fails.
 */
function generateFallbackReview(userData, reposData, metrics) {
  const primaryLang = Object.keys(metrics.languages)[0] || 'JavaScript';
  const score = metrics.careerScore;
  
  let strengths = [
    `Solid foundation in programming with active use of ${primaryLang}.`,
    "Good project diversity demonstrating multi-repository project creation.",
    "Shows solid documentation habits with clear repository descriptions."
  ];
  
  let weaknesses = [
    "Limited evidence of large-scale system design or architecture patterns.",
    "Lower proportion of collaborative or open-source pull requests.",
    "Testing frameworks and automated test coverage could be expanded."
  ];

  let missingSkills = ['Docker', 'TypeScript', 'Jest / Testing Frameworks'];
  if (primaryLang === 'Python') {
    missingSkills = ['PostgreSQL', 'Docker', 'FastAPI'];
  } else if (primaryLang === 'Java') {
    missingSkills = ['Spring Boot', 'Kubernetes', 'AWS'];
  }

  const recommendedProjects = [
    {
      title: `Full-Stack Microservices Application using ${primaryLang}`,
      description: "Build an event-driven system with a database backend, authentication gateway, and containerized deployment.",
      reason: `Demonstrates containerization (Docker) and architecture skills, which are currently missing from the ${primaryLang} repositories.`
    },
    {
      title: "Open Source Contribution or Library",
      description: "Create an npm package, pip library, or maven package that solves a specific utility problem, with unit tests and GitHub Actions CI/CD.",
      reason: "Bumps the Open Source Readiness score and showcases collaborative engineering standards like unit testing and automation."
    }
  ];

  let interviewReadiness = "Ready for initial technical screenings. Shows practical implementation skills, but system design concepts (scaling, caching, message queues) and database optimization should be studied for mid-level systems interviews.";
  if (score > 80) {
    interviewReadiness = "Strong candidate with solid portfolio evidence. Able to discuss database integrations and multi-tier architectures. Should focus on advanced algorithms and system designs to target top-tier companies.";
  }

  const resumeSuggestions = [
    "Highlight repositories that have high stars and detailed READMEs.",
    "Quantify project achievements on the resume (e.g., 'analyzed X parameters in Y seconds').",
    "Add link to the live deployment in the repository descriptions."
  ];

  const hiringProbabilityEstimate = `${Math.min(95, Math.max(45, score + 5))}% - Strong fit for junior ${primaryLang} developer or Full-Stack roles based on codebase activity and repository ratings.`;

  return {
    strengths,
    weaknesses,
    missingSkills,
    recommendedProjects,
    interviewReadiness,
    resumeSuggestions,
    hiringProbabilityEstimate
  };
}

module.exports = {
  generateCareerReview
};
