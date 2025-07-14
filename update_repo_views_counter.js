// Fetches GitHub Traffic API data and updates the visitor count in the README file
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// Environment variables passed from GitHub Actions
const REPO = process.env.REPO;
const GITHUB_TOKEN = process.env.TRAFFIC_TOKEN;
const METRICS_FILE = 'metrics.json';

// Ensure required environment variables are set
if (!GITHUB_TOKEN || !REPO) {
  console.error('Error: TRAFFIC_TOKEN and REPO environment variables must be set.');
  process.exit(1);
}

// Fetch traffic data (last 14 days) from GitHub's API
async function getTrafficData() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/traffic/views`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'visitor-counter'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch traffic data: ${res.status} ${res.statusText}\n${errorText}`);
  }

  return await res.json(); // Returns { count, uniques, views: [{ timestamp, count, uniques }, ...] }
}

// Load existing metrics.json if it exists
function loadMetrics() {
  if (fs.existsSync(METRICS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
    } catch {
      console.warn('Could not parse existing metrics.json, starting fresh.');
    }
  }
  return [];
}

// Save updated metrics to metrics.json
function saveMetrics(metrics) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log(`metrics.json updated with ${metrics.length} historical entries`);
}

// Append new daily entries to metrics.json and return total historical views
function updateMetricsFile(viewData) {
  const existing = loadMetrics();
  const existingDates = new Set(existing.map(entry => entry.timestamp));

  // Add only new entries (avoid duplicates)
  viewData.views.forEach(day => {
    if (!existingDates.has(day.timestamp)) {
      existing.push({
        timestamp: day.timestamp,
        count: day.count,
        uniques: day.uniques
      });
    }
  });

  saveMetrics(existing);

  // Sum all counts to get historical total
  return existing.reduce((sum, entry) => sum + entry.count, 0);
}

// Update Markdown files with a badge showing total historical views
function updateMarkdownBadges(totalViews) {
  const refreshDate = new Date().toISOString().split('T')[0];
  const badgeRegex = /<!-- START BADGE -->[\s\S]*?<!-- END BADGE -->/g;

  const badgeBlock = `<!-- START BADGE -->
<div align="center">
  https://img.shields.io/badge/Total%20views-${totalViews}-limegreen
  <p>Refresh Date: ${refreshDate}</p>
</div>
<!-- END BADGE -->`;

  const markdownFiles = findMarkdownFiles('.');
  markdownFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    if (badgeRegex.test(content)) {
      const updated = content.replace(badgeRegex, badgeBlock);
      fs.writeFileSync(file, updated);
      console.log(`Updated badge in ${file}`);
    } else {
      console.log(`Badge block not found in ${file}`);
    }
  });
}

// Recursively find all Markdown files in the directory
function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

// Clean up node_modules to reduce clutter in the repo
function deleteNodeModules() {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
     }
}

// Main execution block
(async () => {
  try {
    const viewData = await getTrafficData(); // Step 1: Fetch traffic data
    const totalViews = updateMetricsFile(viewData); // Step 2: Update metrics.json
    updateMarkdownBadges(totalViews); // Step 3: Update badges in Markdown files
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    deleteNodeModules(); // Step 4: Clean up
  }
})();
