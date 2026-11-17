# Coin & Compass: notes for Claude

**Read first:** [HOUSE-RULES.md](https://github.com/jcm-book-library/control-room/blob/main/HOUSE-RULES.md) and [STANDARDS.md](https://github.com/jcm-book-library/control-room/blob/main/STANDARDS.md) in `control-room`, then `HANDOVER.md` here. They cover Google Sheet safety, branches and pull requests into `main`, using cheaper models, and the build template. The notes below are this repo's own; where they are more specific, they win. The charter is `project.json`.

## This repo
- `app.html` is the app source; the same file is published as the claude.ai artifact.
- `bash tests/run-all.sh` builds `index.html` and runs the tests. Run it before every push.
- Data lives in the Google Sheet "Personal Budget" (the app owns the whole sheet); tabs and columns are in `docs/data-model.md`.
- No figures live in this repo, including the tests (they use made-up data). The sheet link is saved in the browser (`cc_config`), never in code.
- What it writes is listed in the README. Every write finds its row by ID first.
- BuyList `Total` (column K) is one formula in the header. Never write to it; new rows go in two parts around it.
