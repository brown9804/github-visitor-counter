// Fetches GitHub Traffic API data and updates the visitor count in the README file
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

const REPO = process.env.REPO;
const GITHUB_TOKEN = process.env.TRAFFIC_TOKEN;

if (!GITHUB_TOKEN || !REPO) {
  console.error('Error: TRAFFIC_TOKEN and REPO environment variables must be set.');
  process.exit(1);
}

const METRICS_FILE = 'metrics.json';

// Fetch the last 14 days of traffic data (GitHub API returns up to 14 days)
async function getLast14DaysTraffic() {
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

  const data = await res.json();
  // Each entry contains: timestamp, count, uniques
  return data.views.map(item => ({
    date: item.timestamp.slice(0, 10), // Keep only YYYY-MM-DD
    count: item.count,
    uniques: item.uniques
  }));
}

// Read metrics.json as an array of daily entries (if exists)
function readMetrics() {
  if (fs.existsSync(METRICS_FILE)) {
    const raw = fs.readFileSync(METRICS_FILE, 'utf-8');
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      console.error('metrics.json is not valid JSON. Starting fresh.');
    }
  }
  return [];
}

// Write the updated metrics array back to metrics.json
function writeMetrics(metrics) {
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log(`metrics.json updated with ${metrics.length} days`);
}

// Merge existing and new metrics, using the date as the unique key
function mergeMetrics(existing, fetched) {
  // Use an object for fast deduplication by date
  const byDate = {};
  existing.forEach(entry => { byDate[entry.date] = entry; });
  fetched.forEach(entry => { byDate[entry.date] = entry; });
  // Convert back to array and sort by date ascending
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

// Calculate the sum of all view counts (historical total)
function calculateTotalViews(metrics) {
  return metrics.reduce((sum, entry) => sum + entry.count, 0);
}

// Find and update the badge block in all Markdown files (recursive)
function updateMarkdownBadges(total_views) {
  const refreshDate = new Date().toISOString().split('T')[0];
  const badgeRegex = /<!-- START BADGE -->[\s\S]*?<!-- END BADGE -->/g;

  // This is your existing badge schema, preserved as requested
  const badgeBlock = `<!-- START BADGE -->
<div align="center">
  <img src="https://img.shields.io/badge/Total%20views-${total_views}-limegreen" alt="Total views">
  <p>Refresh Date: ${refreshDate}</p>
</div>
<!-- END BADGE -->`;

  const markdownFiles = findMarkdownFiles('.'); // Find all Markdown files in the directory
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

// Recursively find all Markdown files in a directory
function findMarkdownFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath)); // Recursively search subdirectories
    } else if (file.endsWith('.md')) {
      results.push(filePath); // Add Markdown files to the results
    }
  });
  return results;
}

// Optionally delete node_modules after running
function deleteNodeModules() {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('node_modules folder deleted.');
  }
}

// Main async function to orchestrate update
(async () => {
  try {
    // Fetch latest 14 days of traffic data
    const fetched = await getLast14DaysTraffic();
    // Load existing metrics.json (if present)
    const existing = readMetrics();
    // Merge and deduplicate daily metrics
    const merged = mergeMetrics(existing, fetched);
    // Save the updated metrics array
    writeMetrics(merged);

    // Calculate historical total views for badge
    const total_views = calculateTotalViews(merged);
    // Update the badge in Markdown files
    updateMarkdownBadges(total_views);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    deleteNodeModules(); // Delete node_modules after script execution
  }
})();
