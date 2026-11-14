# Learning OS — Personal Learning Tracker

A standalone subpage of the existing GitHub Pages site, located in `/learning/`.
The international democracy catalogue's existing files are unchanged.

## Features
- 61 daily sessions (14 November 2026–13 January 2027)
- 18 weekly study blocks (14 January–14 May 2027)
- Course and module name, direct Coursera links, module completion and separate practice completion
- Daily and overall percentage, course library, roadmap, notes
- Local browser saving, JSON backup and restore, mobile navigation, offline support

## Privacy and synchronisation
The timetable is public because this repository is public. The user's checkboxes and notes remain in **local browser storage**, not in this repository. Progress **does not sync** between devices; export/import JSON to transfer it.
Do not enter personal client records or confidential case data into a public repository.

## Updating the curriculum
Edit `data.js`, which is generated from the initial Coursera learning spreadsheet. Data format:
`window.PLAN_DATA = { version, daily, weekly, courses };`
Dates use `YYYY-MM-DD`. Completion keys are date-based, preserving progress when text changes.
