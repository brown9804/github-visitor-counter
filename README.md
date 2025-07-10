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

1. **Add the Badge to Your Repository**:
   - Include the following markdown in your `README.md` file:

     ```markdown
        <div align="center">
  <img src="https://img.shields.io/badge/Total%20views-611-yellow" alt="Total views">
  <p>Refresh Date: 2025-07-10</p>
</div>
