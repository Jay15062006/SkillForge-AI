# Contributing to SkillForge AI

Thank you for your interest in contributing to **SkillForge AI** for **Hacktoberfest 2026**! 🎉

## How You Can Contribute
- **Skill Templates**: Add new starter skill templates in `frontend/src/components/SkillPromptForm.jsx`.
- **Validation Rules**: Extend `backend/app/services/validator.py` with domain-specific rules (e.g. testing for tool invocation blocks).
- **New Providers**: Add support for additional open-weight inference hosts in `backend/app/services/ai_generator.py`.
- **UI Enhancements**: Improve accessibility, add theme options, or refine code editor interactions.

## Development Workflow
1. Fork the repository on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/skillforge-ai.git
   cd skillforge-ai
   ```
3. Set up the backend:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\Activate.ps1  # Windows
   pip install -r requirements.txt
   pytest
   ```
4. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. Create a topic branch:
   ```bash
   git checkout -b feature/my-feature
   ```
6. Commit with conventional commit messages (`feat: ...`, `fix: ...`, `docs: ...`).
7. Open a Pull Request on GitHub targeting `main`.

## Hacktoberfest Quality Standards
- PRs must add real value and not be spam.
- All backend tests (`pytest`) and frontend builds (`npm run build`) must pass.
