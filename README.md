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
4. **Trigger the Pipeline**:
   - Add a GitHub Actions workflow (`update-metrics.yml`) to your repository to trigger the visitor counter logic in the main repository.
   - Use the following content for the workflow:

```yaml
name: Trigger Visitor Counter

on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at midnight
  workflow_dispatch: # Allows manual triggering

jobs:
  trigger-counter:
    runs-on: ubuntu-latest

    steps:
      - name: Trigger Visitor Counter Logic
        run: |
          curl -X POST https://api.github.com/repos/<main-repo-owner>/<main-repo-name>/actions/workflows/update-metrics.yml/dispatches \
          -H "Authorization: Bearer ${{ secrets.TRAFFIC_TOKEN }}" \
          -H "Accept: application/vnd.github+json" \
          -d '{"ref":"main"}'
          echo "Visitor counter triggered successfully."
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
  <img src="https://img.shields.io/badge/Total%20views-12345-yellow" alt="Total views">
  <p>Refresh Date: 2025-07-10</p>
</div>
<!-- END BADGE -->
