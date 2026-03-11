# AGENTS.md

## Cursor Cloud specific instructions

This is a client-side-only React SPA (Vite + Tailwind CSS) with no backend, database, or external API dependencies. All data is mocked in-memory.

### Running the app

- `npm run dev` starts the Vite dev server on port 5173.
- The app is served at `http://localhost:5173/WA-DEMO-2.0/` due to the `base` path in `vite.config.js` (configured for GitHub Pages deployment).
- Use `--host 0.0.0.0` flag if you need external access: `npm run dev -- --host 0.0.0.0`.

### Build

- `npm run build` produces static output in `dist/`.

### Linting / Testing

- No ESLint, Prettier, or test framework is configured in this project.
- No automated tests exist.

### Key architecture note

- The entire application lives in a single file: `src/App.jsx` (~418 lines). All UI state, mock data, and business logic are co-located there.
