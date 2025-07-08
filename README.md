# Open Source Visitor Counter

Costa Rica

[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
[![GitHub](https://img.shields.io/badge/--181717?logo=github&logoColor=ffffff)](https://github.com/)
[brown9804](https://github.com/brown9804)

Last updated: 2025-07-08

----------

> A customizable GitHub visitor counter that tracks and displays the number of visits to your GitHub profile or repository. It uses GitHub Pages, JavaScript, and a JSON file to store and update the count, rendering a dynamic SVG badge you can embed in your README.

## Features

- Simple setup using GitHub Pages
- **Daily-updated** visitor counting (using GitHub Traffic API)
- SVG badge for easy embedding
- Open source and customizable
- **Scalable:** supports a reusable workflow for multi-repo use

## How it works

> [!IMPORTANT]
> This counter is updated once per day (not real-time) and shows the total number of visits (including repeat visits) as reported by GitHub.

- A reusable GitHub Action workflow runs *daily* to fetch real visitor data from the GitHub Traffic API.
- The action updates `count.json` and regenerates `visitor.svg` **using the total number of visits (including repeat visits)**.
- The badge is served via GitHub Pages and can be embedded anywhere.

## General Usage

> To display the visitor badge in your README or any markdown file, use the following snippet:

```markdown
![Visitors](https://<your-username>.github.io/<your-repo-name>/visitor.svg)
```

- **Replace `<your-username>` with your GitHub username and `<your-repo-name>` with your repository name.**
- For example, if your username is `brown9804` and your repository is `github-visitor-counter`, use:

    ```markdown
    ![Visitors](https://brown9804.github.io/github-visitor-counter/visitor.svg)
    ```

## Files structure

- .github/workflows/reusable-visitor-counter.yml: `Reusable GitHub Action workflow for updating the badge`
- generate_svg.js: `Fetches data and generates badge`
- count.json: `Stores the latest count`
- visitor.svg: `The badge`
- Dockerfile: `Containerizes the action for reuse`
- action.yml: `Defines the GitHub Action interface`

## Reusable GitHub Action

> [!NOTE]
> You can use this visitor counter as a reusable, containerized GitHub Action in any repository.

**Create a workflow file (e.g., `.github/workflows/update-counter-views.yml`) in your target repository:**

```yaml
name: Use Central Visitor Counter
on:
  schedule:
    - cron: '0 0,12 * * *' # Runs twice daily
  workflow_dispatch:

jobs:
  call-visitor-counter:
    uses: <your-org-or-username>/<central-repo-name>/.github/workflows/reusable-visitor-counter.yml@main
    with:
      repo: ${{ github.repository }}
      token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```

> [!IMPORTANT]
>
> - Replace `<your-org-or-username>` and `<central-repo-name>` with your actual values.
> - Use a Personal Access Token (PAT) with repo access as `PERSONAL_ACCESS_TOKEN` secret in each target repo.
> - The action will update `count.json` and regenerate `visitor.svg` in the central repo.
> - Serve `visitor.svg` via GitHub Pages for embedding.

<div align="center">
  <h3 style="color: #4CAF50;">Total</h3>
  <img src="https://raw.githubusercontent.com/brown9804/github-visitor-counter/main/visitor.svg" alt="Visitor Count" style="border: 2px solid #4CAF50; border-radius: 5px; padding: 5px;"/>
</div>
