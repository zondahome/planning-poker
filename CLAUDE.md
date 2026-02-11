# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planning Poker is a free/open source Scrum/Agile Planning Poker web app built with React 17, TypeScript, Vite, Tailwind CSS, and Firebase Firestore. It enables teams to estimate user stories collaboratively with real-time voting, session management, and dark theme support. The app includes a newer Retro (retrospective) feature currently in development.

**Tech Stack:**
- React 17 + TypeScript + Vite
- Tailwind CSS (v4) + legacy Material-UI v4 components
- Firebase Firestore v8 (namespaced SDK) for realtime backend
- React Router v5
- i18next for internationalization
- Jest + React Testing Library for testing

## Development Commands

**Setup:**
```bash
yarn                              # Install dependencies
cp .env.example .env              # Configure environment (set VITE_USE_FIRESTORE_EMULATOR=true for local dev)
```

**Running locally:**
```bash
npm run start:emulator            # Start Firebase Firestore emulator (requires Java JDK 11+)
yarn start                        # Start dev server at http://localhost:3000
```

**Build and tests:**
```bash
yarn build                        # TypeScript compile + Vite build (outputs to build/)
yarn test                         # Run Jest tests
yarn lint                         # Lint with ESLint
```

**Docker (optional):**
```bash
npm run build                     # Build first
docker build -t planning-poker .  # Build image
docker run -it -p 8080:8080 -p 3000:3000 planning-poker  # Run container
```

## Architecture Layers

The codebase follows a clear layered architecture:

1. **`src/pages/*`** – Route-level composition (React Router v5: `Route`, `Switch`)
2. **`src/components/*`** – Presentational components with localized interaction logic
3. **`src/service/*`** – Business orchestration layer (game & player operations, retro logic)
4. **`src/repository/*`** – Persistence adapters (Firestore + localStorage cache)
5. **`src/types/*`** – Domain TypeScript interfaces & enums
6. **`src/utils/*`** – Pure helper utilities (e.g., `isModerator`)
7. **Tests** – Colocated with components/services (`.test.tsx` or `.test.ts`)

**Critical Rule:** UI never calls repository directly. Always route: `UI → service → repository`

## Core Domain Models

### Planning Poker Game Flow
- **Game**: Sessions with configurable card decks (Fibonacci, T-Shirt, Custom)
- **Player**: Participants with voting status (👍 voted, 🤔 yet to vote)
- **Status**: Enum (`InProgress`, `Finished`) drives game state transitions
- **GameType**: Determines card deck via `CardConfigs`
- **Moderator**: Game creator or anyone if `isAllowMembersToManageSession` is true

**Key Flows:**
- Create Game: `CreateGame` → `addNewGame()` creates game + initial player, caches relation in localStorage
- Join Game: `JoinGame` validates existence, adds player via `addNewPlayer()`, navigates to `/game/:id`
- Game Screen: `Poker` sets Firestore listeners for game & players; redirects if player not recognized
- Voting: `CardPicker` → `updatePlayerValue()` → triggers `updateGameStatus()`
- Reveal/Reset: Moderator calls `finishGame()` or `resetGame()`
- Average: Calculated client-side (`getAverage`) only for numeric decks (not T-Shirt variants)
- Timer: Stores timer state in game doc; countdown computed client-side
- Recent Sessions: Read from localStorage only (no server history yet)

### Retro Feature (In Development)
- **RetroSession**: New feature for team retrospectives (currently on `retro` branch)
- **Structure**: Similar to games but different domain (`RetroSession`, `RetroParticipant`)
- **Status**: Currently only `RetroStatus.Open`
- **Repository**: Separate files in `src/repository/retro/` and `src/service/retro/`

## Firestore Architecture

**SDK Version:** Namespaced v8 (DO NOT mix modular v9 imports)

**Data Structure:**
```
games/{gameId}              # Game documents
  └─ players/{playerId}     # Players subcollection
```

**Emulator:** When `VITE_USE_FIRESTORE_EMULATOR=true`, connects to `localhost:8080`

**Important Patterns:**
- All Firestore interaction goes through `repository/firebase.ts`
- Firestore listeners must return unsubscribe function invoked in `useEffect` cleanup
- Player-to-game relations cached in `repository/localStorage.ts`
- Game deletion: `removeGameFromStore` deletes game doc then iterates players subcollection
- Old game cleanup: `removeOldGameFromStore` removes games older than 6 months

## Styling Guidelines

- **Prefer Tailwind utility classes** for all styling (v4 syntax)
- Maintain dark mode compatibility (use existing `dark:` classes)
- Reuse existing grayscale & accent palette from `CardConfigs`
- Avoid adding arbitrary colors or new CSS files
- Legacy Material-UI v4 components exist but avoid adding more

## Component Patterns

- **Functional components only** with explicit prop interfaces
- Exported functions/components should have explicit return types
- Use hooks with full dependency arrays (no lint suppression)
- Prefer Firestore unsubscribe functions over boolean cleanup flags

## Service & Repository Best Practices

- **All Firestore queries** go through `repository/firebase.ts` (never query directly in components)
- **Business rules** (status transitions, average computations, resets) belong in `service/*` not components
- Keep non-component/shared code in `service/` folder
- Cache management for player-to-game relations stays in `repository/localStorage.ts`

## Domain Business Rules

**Moderator Logic:**
- Either `game.createdById` matches current player OR `isAllowMembersToManageSession` is true
- Use `isModerator` utility to check permissions

**Status Transitions:**
- Player voting sets player `Status.Finished`
- Game status derived from players until reveal
- Final reveal sets game to `Finished`

**Auto Reveal:**
- If `autoReveal=true` and all players finished (game still `InProgress`), trigger `finishGame()`

**Card Decks:**
- Determined by `GameType` via `CardConfigs`
- Custom decks filter out empty display values; maintain order

**Average Calculation:**
- Only computed/shown for non T-Shirt decks
- Excludes non-numeric values (special cards like -1 coffee, -2 question)
- Guard against division by zero

## Testing Conventions

- Use Testing Library semantic queries; `data-testid` only when necessary
- Mock service layer for component tests (e.g., spy on `updatePlayerValue`)
- Add tests for new service utilities (pure functions)
- Run single test: `yarn test <filename>`

## Environment Variables

All environment variables must be prefixed with `VITE_` for Vite exposure:
- `VITE_FB_API_KEY`, `VITE_FB_AUTH_DOMAIN`, etc. – Firebase config
- `VITE_USE_FIRESTORE_EMULATOR` – Set to `true` for local development with emulator

## TypeScript Configuration

- Strict mode enabled
- Target: ESNext
- No `any` usage—introduce or extend interfaces where needed
- Use enums (`Status`, `GameType`, `RetroStatus`) instead of string literals

## Code Style & Patterns

- Prefer early returns over nested `if`
- Keep functions short; extract helper utilities for complex logic
- Use strong types always
- Avoid duplicating code
- Use functional and hooks-based approach for components

## When Adding New Features

**Do:**
- Route through layers: UI → service → repository (never UI → repository directly)
- Add explicit return types to service functions
- Add unit or component tests for new logic paths
- Keep styling inline via Tailwind; reuse existing patterns
- Check moderator permissions via `isModerator` for any privileged action
- Capture and invoke Firestore subscription unsubscribe in `useEffect` cleanup

**Avoid:**
- Introducing new global state libraries (Redux, Zustand) without justification
- Mixing Firestore SDK styles (v8 namespaced + modular v9)
- Hardcoding status strings (use enums)
- Adding unscoped side effects in components
- Querying Firestore directly from components
- Adding new colors or bespoke CSS files

## Extensibility Patterns

**Timer:** Store server timestamp (or client start) in game doc; compute countdown client-side

**History of Rounds:** Add immutable `rounds` array capturing per-finish snapshot before `resetGame`; new UI component reads from that

**Export:** Create pure transformer util (players + rounds → CSV/JSON) in `utils/`; UI button gated by moderator

**AI Assist:** Encapsulate remote calls in `service/ai.ts`; never block main thread; provide cancellable promise

## Edge Cases to Handle

- Player removed mid-session: `Poker` revalidates membership; ensure new membership-dependent components handle undefined `currentPlayerId` until redirect
- Empty or all special cards: Average should not break; handle NaN or zero-player scenarios
- LocalStorage staleness: Consider validating existence asynchronously and pruning stale entries if expanding recent sessions display

## Security & Privacy

- No authentication layer currently; adding roles/auth should centralize user identity (do not rely only on localStorage for trust)
- Clipboard operations must remain user-initiated
- Never expose secrets via `VITE_` environment variables

## Git Workflow

- Main branch: `master`
- Current development branch: `retro` (retrospective feature)
- CI/CD: GitHub Actions for build/tests and Firebase deployment

## Known Tech Debt

1. Add Semantic Release to generate changelog and release notes
2. Add missing unit tests for services (especially autoReveal path, average with custom deck, removeGame cascade, moderator privilege toggling)
3. Replace boolean effect cleanup flags with actual unsubscribe functions from Firestore snapshot listeners
4. Introduce batch writes for game & players deletion for efficiency
