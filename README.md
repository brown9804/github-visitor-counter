# Open Source Visitor Counter

Costa Rica

[![GitHub](https://badgen.net/badge/icon/github?icon=github&label)](https://github.com)
[![GitHub](https://img.shields.io/badge/--181717?logo=github&logoColor=ffffff)](https://github.com/)
[brown9804](https://github.com/brown9804)

Last updated: 2025-05-20

----------

> A customizable GitHub visitor counter that tracks and displays the number of visits to your GitHub profile or repository. It uses GitHub Pages, JavaScript, and a JSON file to store and update the count, rendering a dynamic SVG badge you can embed in your README.

## Features

- Simple setup using GitHub Pages
- **Daily-updated** visitor counting (using GitHub Traffic API)
- SVG badge for easy embedding
- Open source and customizable

## How it works

> [!NOTE]
> This counter is updated once per day (not real-time) and shows the total number of visits (including repeat visits) as reported by GitHub.

- A GitHub Action runs `daily to fetch real visitor data from the GitHub Traffic API.`
- The action updates `count.json` and regenerates `visitor.svg` **using the total number of visits (including repeat visits)**.
- The badge is served via GitHub Pages and can be embedded anywhere:


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

- `.github/workflows/update.yml` (GitHub Action for daily update)
- `generate_svg.js` (fetches data and generates badge)
- `count.json` (stores the latest count)
- `visitor.svg` (the badge)
- `Dockerfile` (containerizes the action for reuse)
- `action.yml` (defines the GitHub Action interface)

## Reusable GitHub Action

> You can use this visitor counter as a reusable, containerized GitHub Action in any repository.

1. Create a workflow file (e.g., `.github/workflows/update.yml`) in your repository:

    ```yaml
    name: Update Visitor Counter
    on:
      schedule:
        - cron: '0 0,12 * * *' # Runs twice daily
      workflow_dispatch:
    
    jobs:
      update:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: ./ # or username/repo@v1 if published
            with:
              token: ${{ secrets.GITHUB_TOKEN }}
          - name: Commit and push changes
            run: |
              git config --global user.name 'github-actions[bot]'
              git config --global user.email 'github-actions[bot]@users.noreply.github.com'
              git add count.json visitor.svg
              git commit -m "Update visitor count" || echo "No changes to commit"
              git push
    ```

- The action will update `count.json` and regenerate `visitor.svg`.
- Serve `visitor.svg` via GitHub Pages for embedding.
