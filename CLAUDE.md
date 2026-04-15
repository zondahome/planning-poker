# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planning Poker is a real-time Scrum estimation tool built with React 17, Vite, Tailwind CSS 4, and Firebase Firestore. Players create/join game sessions, pick estimation cards, and results are revealed simultaneously.

## Commands

```bash
yarn start              # Dev server (Vite, port 5173)
yarn build              # TypeScript check + Vite production build (outputs to build/)
yarn test               # Run all Jest tests
yarn test -- --testPathPattern=<pattern>  # Run a single test file
yarn lint               # ESLint
yarn start:emulator     # Start Firestore emulator on port 8080
yarn serve              # Preview production build locally
```

For local development with the emulator, set `VITE_USE_FIRESTORE_EMULATOR=true` in `.env` and run both `yarn start:emulator` and `yarn start`.

## Environment Variables

All prefixed with `VITE_FB_*` (Firebase config): `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`. Plus `VITE_USE_FIRESTORE_EMULATOR` for local dev.

## Architecture

**Data flow**: Components → Service layer (`src/service/`) → Repository layer (`src/repository/firebase.ts`) → Firestore

- **`src/pages/`** — Route-level components: HomePage, GamePage, JoinPage, etc.
- **`src/components/`** — Feature-grouped UI components (Poker/, Players/, Toolbar/)
- **`src/service/`** — Business logic for games and players (CRUD, status transitions, card management)
- **`src/repository/`** — Firebase Firestore operations and localStorage for recent games cache
- **`src/types/`** — TypeScript interfaces: `Game`, `Player`, `Status`
- **`src/config/`** — i18next setup with 11 languages (translations in `public/locales/`)

**Routing**: React Router v5 with `<Switch>`/`<Route>`. Key routes: `/` (home), `/game/:id` (game session), `/join/:id` (join flow).

**State**: No global store. Component-local state via hooks + Firestore real-time listeners for sync across players.

**Styling**: Tailwind CSS 4 (utility-first) + Material-UI v4 (ThemeProvider, some components/icons). Prefer Tailwind for new styles.

## Testing

Jest 29 + React Testing Library in jsdom. Tests live alongside source files as `*.test.ts(x)`. Firebase and services are mocked in tests. Test setup in `src/setupTests.ts` initializes i18n and mocks clipboard.

## Development Guidelines

- Functional components with hooks only
- Strong TypeScript types — avoid `any`
- Use Tailwind CSS for styling (not inline styles or new CSS files)
- Keep components simple and composable
- No code duplication

## Deployment

CI/CD via GitHub Actions (`.github/workflows/deploy-to-aws.yml`): push to master triggers `yarn build` and S3 sync. Firebase Hosting also configured but secondary.
