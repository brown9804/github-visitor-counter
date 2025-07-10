// Fetches GitHub Traffic API data and updates the visitor count in the README file
const fs = require('fs');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

const REPO = process.env.REPO;
const GITHUB_TOKEN = process.env.TRAFFIC_TOKEN;

if (!GITHUB_TOKEN || !REPO) {
  console.error('Error: TRAFFIC_TOKEN and REPO environment variables must be set.');
  process.exit(1);
}

const README_FILE = 'README.md';
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
  const totalViews = data.count || 0; // Use the accumulated count from the API response

  return totalViews;
}

function updateMetricsFile(count) {
  const updateDate = new Date().toISOString();
  fs.writeFileSync(METRICS_FILE, JSON.stringify({ count, lastUpdated: updateDate }, null, 2));
  console.log(`Metrics updated in ${METRICS_FILE}`);
}

function updateReadmeFile(count) {
  const refreshDate = new Date().toISOString().split('T')[0];
  const badge = `<div align="center">
  <img src="https://img.shields.io/badge/Total%20views-${count}-yellow" alt="Total views">
  <p>Refresh Date: ${refreshDate}</p>
</div>`;

  const readme = fs.readFileSync(README_FILE, 'utf-8');
  const updatedReadme = readme.replace(
    /<!-- START BADGE -->[\s\S]*?<!-- END BADGE -->/,
    `<!-- START BADGE -->\n${badge}\n<!-- END BADGE -->`
  );

  fs.writeFileSync(README_FILE, updatedReadme);
  console.log(`README updated with visitor count: ${count}`);
}

function deleteNodeModules() {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('node_modules folder deleted.');
  }
}

(async () => {
  try {
    const count = await getVisitorCount();
    updateMetricsFile(count);
    updateReadmeFile(count);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    deleteNodeModules(); // Delete node_modules after script execution
  }
})();
