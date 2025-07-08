// Fetches GitHub Traffic API data, updates count.json, and regenerates visitor.svg
const fs = require('fs');
const fetch = require('node-fetch');

const REPO = process.env.REPO || 'brown9804/github-visitor-counter';
const GITHUB_TOKEN = process.env.TRAFFIC_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: TRAFFIC_TOKEN environment variable is not set.');
  process.exit(1);
}

const COUNT_FILE = 'count.json';
const SVG_FILE = 'visitor.svg';

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
  const totalViews = Array.isArray(data.views)
    ? data.views.reduce((sum, day) => sum + (day.count || 0), 0)
    : 0;

  return totalViews;
}

function updateCountFile(count) {
  fs.writeFileSync(COUNT_FILE, JSON.stringify({ count }, null, 2));
}

function generateSVG(count) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40">
  <rect width="180" height="40" fill="#555" />
  <text x="90" y="25" fill="#fff" font-size="18" text-anchor="middle" alignment-baseline="middle">
    Visitors: ${count}
  </text>
</svg>`;
}

function updateSVG(count) {
  fs.writeFileSync(SVG_FILE, generateSVG(count));
}

(async () => {
  try {
    const count = await getVisitorCount();
    updateCountFile(count);
    updateSVG(count);
    console.log(`Updated visitor count: ${count}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


