# Learning OS v4 — Structured, self-paced technology learning

Live URL: https://khrekhviashvili-11.github.io/georgia-democracy-catalogue/learning/

## Why this version

The learner already has advanced experience defining research and human-rights tasks and working with AI conversationally, but starts at a beginner level with GitHub, web architecture, APIs, automation, document processing, Claude Code, and NotebookLM.

This is **not** a programmer bootcamp or an obligatory course-completion schedule. It gives an understandable map of technological possibilities, builds foundational mental models, and uses real, low-risk Research OS examples.

## Primary learning path

Seven modules in a logical progression, accessible in any order (39 topics in total):

1. **Technology foundations:** website vs web app, frontend/backend/database/hosting, HTML/CSS/JS/JSON/PDF, inputs/outputs, basic requests.
2. **GitHub and projects:** repository, commit, branch, GitHub Pages, GitHub Actions, public-repository risks.
3. **Python foundations (new):** Python setup, data types, control flow, lists/dictionaries, functions/errors, files, CSV/JSON, fetching web content, reading PDFs and examining Research OS's existing extraction script.
4. **AI document research:** direct PDF vs landing page, NotebookLM, ChatGPT, source verification, PDF extraction/OCR.
5. **AI-assisted software development:** Claude Chat vs Claude Code, permissions, reading a project, small changes, debugging/testing.
6. **APIs and automation:** HTTP/API, triggers, workflow state, n8n, GitHub Actions, safety.
7. **Advanced AI systems (optional deepening):** semantic search, RAG, agents, architecture choices, human review.

The modules, lessons, example tasks, and selected resources are maintained in `flexible-program.js`. The active view also includes a **Capabilities Library** for ideas such as webpage monitoring, searchable documents, source-backed briefs, and integrating apps.

Every lesson has three separately tracked activities:
- **საფუძველი (foundation):** Have read/understood the concept.
- **არჩევითი პრაქტიკა (optional practice):** Tried the example.
- **სურვილისამებრ გაღრმავება (optional deepening):** Explored advanced material.

Only the foundation count is summarized by module. There is **no mandatory assessment, deadline, certification, or forced transition**. The practical and deepening counts are separate and do not penalize progression.

## Udemy learning resources (nine enrolled)

- Complete Claude AI Masterclass: Beginner to Advanced (Claude general ecosystem: Projects, Artifacts, Skills, Connectors)
- **Confirmed enrolled via user, available in Udemy Personal Plan:** Automate the Boring Stuff with Python Programming (Al Sweigart, 9h 31m total; course selection focuses on essentials and document automation)
- Claude Code – The Ultimate Guide! Build Websites & SaaS Apps
- Complete Claude Code Course: Beginner to Advanced
- GitHub Actions – The Complete Guide
- GitHub Actions: The Complete Guide from Beginner to Expert
- AI Automation: Build LLM Apps & AI-Agents with n8n & APIs
- Mastering ChatGPT Work and GPT-6 Astra [2026]
- Gemini Notebook: The Ultimate in AI NoteTaking (2026)

All nine courses are recorded as enrolled, based on user confirmation. The Python course is available through the user's Udemy Personal Plan. Lesson/section descriptions within the app are **topical navigation hints**, not verified deep links to specific paid videos, and may differ as Udemy course sections are updated.

## Preserving earlier work

- **v2 eight-week project-first plan:** `active-program.js`, still available from the application's archival view.
- **Original daily/monthly course calendar:** `data.js`, still available in the archival daily and roadmap views.
- **Original hands-on Research OS tutorial:** `build-lab.js`, still available in Practical Lab.
- Previously saved progress is untouched: v1/v2 keys (`d:`, `w:`, `p:`, `lab:`) remain.
- v3 keys use `f:<topic-id>:(learn|practice|depth)` and text notes `flex:<module-id>`.
- All versions continue to use the existing localStorage key `learning-os-state-v1`. Progress is **browser-local** and isn't synced between devices. Users can use the existing JSON backup/export/import in the Settings view.

## Privacy

The Pages repository and public training examples are publicly accessible. Do not commit client cases, personal identifiers, confidential reports, API keys, credentials, or private files. Complete experiments using public or synthetic data, and review the data policies of any external AI tool before uploading content.

## Python learning path and verified content

The Python course was examined via the connected Udemy syllabus, including named lectures in Python Basics, Flow Control, Functions, Handling Errors with try/except, Lists, Dictionaries, Files, Web Scraping and Excel/Word/PDF Documents.

Seven optional foundation topics were added as module **03** after GitHub. Every lesson has a selected lecture description, a concept explanation, an optional exercise, optional deepening, and course link. Module numbers shifted but **all existing module IDs, topic IDs, and progress keys were retained**.

The course syllabus returned by Udemy did not explicitly list JSON/CSV units. We therefore supply supplementary official Python library references to json and csv in that topic; we do **not** claim they are part of the recorded Udemy syllabus. Similarly, PDF reading in the course demonstrates the concept, while the existing Research OS script uses PyMuPDF specifically. Hands-on exercises use public or synthetic records and require no client/confidential uploads.

Udemy connection currently supports search and retrieving course curriculum but does **not** expose the learner's enrolled courses or watched-video progress. Browser-local Learning OS checkboxes therefore remain separate from Udemy course completion.
