import { generateWithRetry } from '../config/gemini.js';

/**
 * GitHub Repository Analyzer Agent
 * Fetches a GitHub repo and extracts architecture diagram
 */

const GITHUB_API_BASE = 'https://api.github.com';

// File patterns to analyze for understanding project structure
const IMPORTANT_FILES = [
  'README.md',
  'readme.md',
  'package.json',
  'requirements.txt',
  'setup.py',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'composer.json',
  'Gemfile',
  'tsconfig.json',
  'docker-compose.yml',
  'Dockerfile',
  '.env.example',
];

// Folders that typically contain main source code
const SOURCE_FOLDERS = ['src', 'lib', 'app', 'core', 'pkg', 'internal', 'cmd', 'api', 'server', 'client', 'components', 'pages', 'routes', 'models', 'controllers', 'services', 'utils', 'helpers'];

// Files to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git\//,
  /dist\//,
  /build\//,
  /\.min\./,
  /\.map$/,
  /\.lock$/,
  /package-lock\.json/,
  /yarn\.lock/,
];

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url) {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
    /^([^\/]+)\/([^\/\s]+)$/,  // owner/repo format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }
  
  throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo or owner/repo');
}

/**
 * Fetch repository metadata
 */
async function fetchRepoInfo(owner, repo) {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MindMapAI-Agent',
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository not found: ${owner}/${repo}`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again later or use a GitHub token.');
    }
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch repository tree (file structure)
 */
async function fetchRepoTree(owner, repo, branch = 'main') {
  // Try main branch first, then master
  const branches = [branch, 'main', 'master'];
  
  for (const branchName of branches) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'MindMapAI-Agent',
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return { tree: data.tree, branch: branchName };
      }
    } catch (e) {
      continue;
    }
  }
  
  throw new Error('Could not fetch repository structure. Check if the repository exists and is public.');
}

/**
 * Fetch file content from GitHub
 */
async function fetchFileContent(owner, repo, path, branch = 'main') {
  const response = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
    {
      headers: { 'User-Agent': 'MindMapAI-Agent' },
    }
  );
  
  if (!response.ok) return null;
  
  const text = await response.text();
  // Limit content size to avoid token limits
  return text.slice(0, 5000);
}

/**
 * Analyze repository structure
 */
function analyzeStructure(tree) {
  const structure = {
    folders: new Set(),
    files: [],
    languages: new Set(),
    frameworks: [],
    components: [],
  };
  
  const extensionMap = {
    '.js': 'JavaScript',
    '.jsx': 'React',
    '.ts': 'TypeScript',
    '.tsx': 'React TypeScript',
    '.py': 'Python',
    '.java': 'Java',
    '.go': 'Go',
    '.rs': 'Rust',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.cs': 'C#',
    '.cpp': 'C++',
    '.c': 'C',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.vue': 'Vue.js',
    '.svelte': 'Svelte',
  };
  
  for (const item of tree) {
    // Skip ignored patterns
    if (SKIP_PATTERNS.some(p => p.test(item.path))) continue;
    
    if (item.type === 'tree') {
      const folderName = item.path.split('/').pop();
      if (SOURCE_FOLDERS.includes(folderName.toLowerCase())) {
        structure.folders.add(folderName);
      }
    } else if (item.type === 'blob') {
      const ext = '.' + item.path.split('.').pop();
      if (extensionMap[ext]) {
        structure.languages.add(extensionMap[ext]);
      }
      
      // Track important source files
      const fileName = item.path.split('/').pop();
      const folderPath = item.path.split('/').slice(0, -1).join('/');
      
      if (IMPORTANT_FILES.includes(fileName) || 
          (SOURCE_FOLDERS.some(f => folderPath.includes(f)) && 
           Object.keys(extensionMap).some(e => fileName.endsWith(e)))) {
        structure.files.push({
          path: item.path,
          name: fileName,
          folder: folderPath,
        });
      }
    }
  }
  
  return structure;
}

/**
 * Generate project analysis prompt for Gemini
 */
function createAnalysisPrompt(repoInfo, structure, fileContents) {
  return `You are a software architecture analyst. Analyze this GitHub repository and extract key concepts for a mind map diagram.

REPOSITORY: ${repoInfo.full_name}
DESCRIPTION: ${repoInfo.description || 'No description'}
LANGUAGE: ${repoInfo.language || 'Unknown'}
STARS: ${repoInfo.stargazers_count}

DETECTED TECHNOLOGIES: ${Array.from(structure.languages).join(', ')}
SOURCE FOLDERS: ${Array.from(structure.folders).join(', ')}

FILE CONTENTS:
${fileContents}

TASK: Extract the main architectural concepts and their relationships from this codebase.

Return a JSON object with this EXACT structure:
{
  "concepts": [
    {"name": "ConceptName", "category": "category", "importance": 1-5}
  ],
  "relationships": [
    {"source": "ConceptA", "relation": "uses", "target": "ConceptB"}
  ]
}

CATEGORIES to use: "core", "component", "service", "model", "util", "config", "external", "framework"

RULES:
1. Extract 10-25 meaningful concepts (not individual files)
2. Focus on: main components, services, data models, external integrations, frameworks
3. Use SHORT relation words: "uses", "has", "creates", "extends", "imports", "calls", "stores", "serves"
4. importance: 5=core/main, 4=important, 3=standard, 2=supporting, 1=minor
5. Group related files into single concepts (e.g., all route files → "API Routes")
6. Include the tech stack as concepts (React, Express, MongoDB, etc.)

Return ONLY valid JSON, no markdown or explanation.`;
}

/**
 * Main function to analyze a GitHub repository
 */
export async function analyzeGitHubRepo(githubUrl) {
  console.log(`🔍 Analyzing GitHub repository: ${githubUrl}`);
  
  // Parse URL
  const { owner, repo } = parseGitHubUrl(githubUrl);
  console.log(`📦 Repository: ${owner}/${repo}`);
  
  // Fetch repo info
  const repoInfo = await fetchRepoInfo(owner, repo);
  console.log(`✅ Found: ${repoInfo.full_name} - ${repoInfo.description || 'No description'}`);
  
  // Fetch file tree
  const { tree, branch } = await fetchRepoTree(owner, repo, repoInfo.default_branch);
  console.log(`📂 Fetched ${tree.length} items from ${branch} branch`);
  
  // Analyze structure
  const structure = analyzeStructure(tree);
  console.log(`🔬 Languages: ${Array.from(structure.languages).join(', ')}`);
  
  // Fetch important file contents
  const filesToFetch = structure.files.slice(0, 10); // Limit to 10 files
  const fileContents = [];
  
  for (const file of filesToFetch) {
    const content = await fetchFileContent(owner, repo, file.path, branch);
    if (content) {
      fileContents.push(`\n--- ${file.path} ---\n${content.slice(0, 2000)}`);
    }
  }
  
  console.log(`📄 Read ${fileContents.length} files for analysis`);
  
  // Generate analysis with Gemini
  const prompt = createAnalysisPrompt(repoInfo, structure, fileContents.join('\n'));
  const response = await generateWithRetry(prompt);
  
  // Parse response
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  let analysis;
  try {
    analysis = JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      analysis = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse AI analysis');
    }
  }
  
  // Format for frontend
  const concepts = (analysis.concepts || []).map(c => ({
    name: c.name,
    category: c.category || 'component',
    importance: c.importance || 3,
  }));
  
  const relationships = (analysis.relationships || []).map(r => ({
    source: r.source,
    relation: r.relation,
    target: r.target,
  }));
  
  console.log(`🎯 Extracted ${concepts.length} concepts and ${relationships.length} relationships`);
  
  return {
    repoInfo: {
      name: repoInfo.name,
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      url: repoInfo.html_url,
    },
    concepts,
    relationships,
    metadata: {
      languages: Array.from(structure.languages),
      folders: Array.from(structure.folders),
      analyzedFiles: filesToFetch.map(f => f.path),
    },
  };
}
