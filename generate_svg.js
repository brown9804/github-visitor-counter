// Fetches GitHub Traffic API data, updates count.json, and regenerates visitor.svg
const fs = require('fs');
const fetch = require('node-fetch');

const REPO = 'brown9804/github-visitor-counter';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const COUNT_FILE = 'count.json';
const SVG_FILE = 'visitor.svg';

async function getVisitorCount() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/traffic/views`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch traffic data');
  const data = await res.json();
  // Sum all daily counts for total views (not just uniques)
  const totalViews = Array.isArray(data.views)
    ? data.views.reduce((sum, day) => sum + (day.count || 0), 0)
    : 0;
  return totalViews;
}

function updateCountFile(count) {
  fs.writeFileSync(COUNT_FILE, JSON.stringify({ count }, null, 2));
}

function generateSVG(count) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"180\" height=\"40\">\n  <rect width=\"180\" height=\"40\" fill=\"#555\" />\n  <text x=\"90\" y=\"25\" fill=\"#fff\" font-size=\"18\" text-anchor=\"middle\" alignment-baseline=\"middle\">Visitors: ${count}</text>\n</svg>\n`;
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
