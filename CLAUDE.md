# Coin & Compass: notes for Claude

**Read the house rules first:** [HOUSE-RULES.md](https://github.com/jcm-book-library/control-room/blob/main/HOUSE-RULES.md) in `control-room` (plain text: https://raw.githubusercontent.com/jcm-book-library/control-room/main/HOUSE-RULES.md). They cover Google Sheet safety, branches and pull requests into `main`, using cheaper models to save usage credits, and the build template. The notes below are this repo's own; where they are more specific, they win. The project charter is `project.json`.

## This repo
- `app.html` is the app source; the same file is published as the claude.ai artifact.
- `python3 tools/build-pages.py` rebuilds `index.html` from `app.html` for GitHub Pages.
- Data lives in the Google Sheet "Personal Budget"; the tabs and columns are in `docs/data-model.md`.
- "No figures live in this repo. Everything personal stays in the sheet, behind Google sign-in."
- What it writes: "new rows on Balances (check-ins), and the Paid tick on Instalments. Nothing else."
