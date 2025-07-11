# Open Source Visitor Counter

Costa Rica

[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
[![GitHub](https://img.shields.io/badge/--181717?logo=github&logoColor=ffffff)](https://github.com/)
[brown9804](https://github.com/brown9804)

Last updated: 2025-07-10

----------

> This repository provides a customizable GitHub visitor counter that tracks and displays the number of visits to your GitHub profile or repository. The counter updates daily using the GitHub Traffic API and writes the total views directly into the README file.

## Features

- **Daily-updated visitor counting**: Fetches real visitor data from the GitHub Traffic API.
- **Markdown-based display**: Updates the README file with the total visitor count.
- **Open source and customizable**.

## How it works

> [!IMPORTANT]
> This counter is updated once per day (not real-time) and shows the total number of visits (including repeat visits) as reported by GitHub.

- A GitHub Action workflow runs daily to fetch visitor data from the GitHub Traffic API.
- The action updates the `README.md` file with the total visitor count and the refresh timestamp.

## How to use it

1. **Add the Badge to Your Repository**: Include the following markdown in your `README.md` file, between the `START BADGE` and `END BADGE` (included), as shown in the bottom.
2. **Create a Personal Access Token**:
   - Go to **GitHub Settings** > **Developer Settings** > **Personal Access Tokens**.
   - Generate a new token with `repo` access.
3. **Save the Token as a Secret**:
   - In your repository, navigate to **Settings** > **Secrets and Variables** > **Actions**.
   - Add a new secret named `TRAFFIC_TOKEN` and paste the generated token.
4. **Add the Pipeline**: This single pipeline will fetch the visitor count, update the badge in the `README.md` file, and push the changes back to the repository.
   - Create a GitHub Actions workflow (`use-visitor-counter.yml`) in your repository to handle the visitor counter logic.
   - Use the following content for the workflow, you can use [this pipeline as refence](https://github.com/brown9804/Cloud-DevOps-Overview/blob/main/.github/workflows/use-visitor-counter.yml).

   ```yaml
   name: Use Visitor Counter Logic
   
   on:
     pull_request:
       branches:
         - main
     schedule:
       - cron: '0 0 * * *' # Runs daily at midnight
     workflow_dispatch:  # Allows manual triggering
   
   permissions:
     contents: write
     pull-requests: write
   
   jobs:
     update-visitor-count:
       runs-on: ubuntu-latest
   
       steps:
         - name: Checkout current repository
           uses: actions/checkout@v4
           with:
             fetch-depth: 0
   
         - name: Shallow clone visitor counter logic
           run: git clone --depth=1 https://github.com/brown9804/github-visitor-counter.git
   
         - name: Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
   
         - name: Install dependencies for github-visitor-counter
           run: |
             cd github-visitor-counter
             npm ci
   
         - name: Run visitor counter logic (updates markdown badges and metrics.json)
           run: node github-visitor-counter/update_repo_views_counter.js
           env:
             TRAFFIC_TOKEN: ${{ secrets.TRAFFIC_TOKEN }}
             REPO: ${{ github.repository }}
   
         - name: Move generated metrics.json to root
           run: mv github-visitor-counter/metrics.json .
   
         - name: List files for debugging
           run: |
             ls -l
             ls -l github-visitor-counter
   
         - name: Clean up visitor counter logic
           run: rm -rf github-visitor-counter
   
         - name: Configure Git author
           run: |
             git config --global user.name "github-actions[bot]"
             git config --global user.email "github-actions[bot]@users.noreply.github.com"
   
         - name: Commit and push changes (PR)
           if: github.event_name == 'pull_request'
           env:
             TOKEN: ${{ secrets.GITHUB_TOKEN }}
           run: |
             git fetch origin
             git checkout -b ${{ github.event.pull_request.head.ref }} origin/${{ github.event.pull_request.head.ref }}
             git add "*.md" metrics.json
             git commit -m "Update visitor count" || echo "No changes to commit"
             git remote set-url origin https://x-access-token:${TOKEN}@github.com/${{ github.repository }}
             git pull --rebase origin ${{ github.event.pull_request.head.ref }} || echo "No rebase needed"
             git push origin HEAD:${{ github.event.pull_request.head.ref }}
   
         - name: Commit and push changes (non-PR)
           if: github.event_name != 'pull_request'
           env:
             TOKEN: ${{ secrets.GITHUB_TOKEN }}
           run: |
             git fetch origin
             git checkout ${{ github.event.pull_request.head.ref }} || git checkout -b ${{ github.event.pull_request.head.ref }} origin/${{ github.event.pull_request.head.ref }}
             git add "*.md" metrics.json
             git commit -m "Update visitor count" || echo "No changes to commit"
             git remote set-url origin https://x-access-token:${TOKEN}@github.com/${{ github.repository }}
             git pull --rebase origin ${{ github.event.pull_request.head.ref }} || echo "No rebase needed"
             git push origin HEAD:${{ github.event.pull_request.head.ref }}
   
         - name: Create Pull Request (non-PR)
           if: github.event_name != 'pull_request'
           uses: peter-evans/create-pull-request@v6
           with:
             token: ${{ secrets.GITHUB_TOKEN }}
             branch: update-visitor-count
             title: "Update visitor count"
             body: "Automated update of visitor count"
             base: main
   ```

## Files structure

- `README.md`: Contains instructions and displays the visitor count badge.
- `update_repo_views_counter.js`: Script to fetch visitor count data from the GitHub Traffic API and update the `README.md` file.
- `package.json`: Defines dependencies and scripts for the project.
- `LICENSE`: Specifies the license for the project.

> [!IMPORTANT]
>
> - Replace `<main-repo-owner>` and `<main-repo-name>` with your actual values.
> - Use a Personal Access Token (PAT) with `repo` access as `TRAFFIC_TOKEN` secret in each target repository.
> - The action will trigger the visitor counter logic in the main repository and update the badge dynamically.

<!-- START BADGE -->
<div align="center">
  <img src="https://img.shields.io/badge/Total%20views-1022-limegreen" alt="Total views">
  <p>Refresh Date: 2025-07-11</p>
</div>
<!-- END BADGE -->
