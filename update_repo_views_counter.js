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

async function getVisitorCount() {
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
  return data.count || 0;
}

function updateMetricsFile(total_views) {
  const lastUpdated = new Date().toISOString();
  const metrics = { total_views, lastUpdated };
  fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  console.log(`metrics.json updated with ${total_views} views`);
}

function updateMarkdownBadges(total_views) {
  const refreshDate = new Date().toISOString().split('T')[0];
  const badgeRegex = /<!-- START BADGE -->[\\s\\S]*?<!-- END BADGE -->/g;

  const badgeBlock = `<!-- START BADGE -->
<div align="center">
  https://img.shields.io/badge/Total%20views-${total_views}-limegreen
  <p>Refresh Date: ${refreshDate}</p>
</div>
<!-- END BADGE -->`;

  const markdownFiles = findMarkdownFiles('.');
  markdownFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    if (content.includes('Total%20views') && content.includes('<!-- START BADGE -->') && content.includes('<!-- END BADGE -->')) {
      const updated = content.replace(badgeRegex, badgeBlock);
      fs.writeFileSync(file, updated);
      console.log(`Updated badge in ${file}`);
    }
  });
}

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

function deleteNodeModules() {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('node_modules folder deleted.');
  }
}

(async () => {
  try {
    const total_views = await getVisitorCount();
    updateMetricsFile(total_views);
    updateMarkdownBadges(total_views);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    deleteNodeModules(); // Delete node_modules after script execution
  }
})();
