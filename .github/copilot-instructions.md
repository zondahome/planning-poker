# Copilot Instructions for Planning Poker

## Project Overview
- React 17 + TypeScript + Vite.
- UI: Tailwind CSS utilities plus legacy Material-UI v4 components.
- Realtime backend: Firebase Firestore (v8 namespaced SDK). Optional local emulator when `VITE_USE_FIRESTORE_EMULATOR === 'true'`.
- State: Local React state + Firestore snapshot listeners (no global store).
- Domain entities: Game, Player, Status, GameType (drives card decks).

## Architecture Layers
1. `src/pages/*` – Route-level composition (React Router v5: `Route`, `Switch`).
2. `src/components/*` – Presentational & localized interaction logic.
3. `src/service/*` – Business orchestration (game & player operations). Keep side-effect coordination here.
4. `src/repository/*` – Persistence adapters (Firestore + localStorage cache). No UI logic.
5. `src/types/*` – Domain TypeScript interfaces & enums.
6. `src/utils/*` – Pure helper utilities (e.g., `isModerator`).
7. Tests colocated with components/services (Jest + Testing Library).

## Core Flows
- Create Game: `CreateGame` -> `addNewGame()` (creates game + initial player, caches relation in localStorage).
- Join Game: `JoinGame` validates existence, adds player, then navigates to `/game/:id`.
- Game Screen: `Poker` sets Firestore listeners for game & players; redirects to join if player not recognized.
- Voting: `CardPicker` invokes `updatePlayerValue()` -> updates player doc -> triggers `updateGameStatus()`.
- Reveal / Reset: Moderator (or any if `isAllowMembersToManageSession`) calls `finishGame()` or `resetGame()`.
- Average: Calculated client-side (`getAverage`) only for numeric decks (not T-Shirt variants).
- Recent Sessions: Read purely from localStorage (no server history yet).

## Firestore Usage
- SDK: Namespaced v8. Do NOT mix modular v9 imports in new code unless planning full migration.
- Structure: `games/{gameId}` documents; `players` subcollection.
- Emulator: When `VITE_USE_FIRESTORE_EMULATOR==='true'`, point to `hostname:8080`.
- Deletion: `removeGameFromStore` deletes game doc then iterates players (note: improve by batching if needed later).
- Old Cleanup: `removeOldGameFromStore` removes games older than 6 months using `createdAt` comparison.

## Styling Guidelines
- Prefer Tailwind utility classes for new styling; avoid adding bespoke CSS files.
- Maintain dark mode compatibility (existing `dark:` classes); reuse existing grayscale & accent palette.
- Avoid introducing arbitrary colors; if needed mirror style consistency of `CardConfigs` palette.

## Component Patterns
- Functional components only, with explicit prop interfaces.
- Exported functions/components should have explicit return types where feasible.
- Use hooks with full dependency arrays (no silent lint suppression). Prefer Firestore unsubscribe over boolean cleanup flag if refactoring listeners.

## Services & Repository Practices
- All Firestore interaction goes through repository functions (`repository/firebase.ts`). Do not query Firestore directly in components.
- Cache management for player-to-game relations stays in `repository/localStorage.ts`.
- Keep business rules (status transitions, average computations, resets) inside `service/*` not components.

## Domain Rules
- Moderator: Either game `createdById` matches current player or `isAllowMembersToManageSession` is true.
- Status transitions: Player voting sets `Status.Finished`; game status derived from players until reveal; final reveal sets game to `Finished`.
- Auto Reveal: If `autoReveal` true and all players finished (still `In Progress`), trigger `finishGame()`.
- Decks: Determined by `GameType` via `CardConfigs`. Custom decks filter out empty display values; maintain order.
- Average: Only computed/shown for non T-Shirt decks. Excludes non-numeric / special (-1 coffee, -2 question) values.

## Testing Conventions
- Use Testing Library semantic queries; `data-testid` only when necessary.
- Mock service layer for component tests (e.g., spy on `updatePlayerValue`).
- Add tests for new service utilities (pure functions) easily.
- Suggested missing tests (future): autoReveal path, average with custom deck numeric vs mixed values, removeGame cascade, moderator privilege toggling.

## Performance & Reliability
- When adding new listeners, always capture and invoke Firestore subscription unsubscribe in `useEffect` cleanup.
- Guard division by zero in any new average-like computations.
- Avoid unnecessary JSON.stringify in dependencies; extract derived arrays/objects with memoization if complexity grows.

## Extensibility Guidelines
Feature patterns:
- Timer: Store a server timestamp (or agreed client start) in game doc; compute countdown client-side. Keep timer logic pure; minimal re-renders.
- History of Rounds: Add immutable `rounds` array capturing per-finish snapshot before `resetGame`; new UI component reads from that.
- Export: Create pure transformer util (players + rounds -> CSV/JSON) in `utils/`; UI button gated by moderator.
- AI Assist: Encapsulate remote calls in `service/ai.ts`; never block main thread; provide cancellable promise.

## Code Style
- Prefer early returns over nested `if`.
- Use enums (`Status`, `GameType`) instead of string literals.
- Narrow `any` usage—introduce or extend interfaces where needed.
- Keep functions short; extract helper utilities for complex logic.

## Edge Cases
- Player removed mid-session: `Poker` already revalidates membership; ensure any new membership-dependent component gracefully handles undefined currentPlayerId until redirect.
- Empty or all special cards: Average should not break; handle NaN or zero-player scenarios.
- LocalStorage staleness: If expanding recent sessions display, consider validating existence asynchronously and pruning stale entries.

## Environment & Build
- Environment variables must be prefixed with `VITE_` for Vite exposure. Do not expose secrets inadvertently.
- Avoid CRA legacy scripts; rely on `vite` commands.
- Keep TypeScript configuration consistent; avoid downgrading strictness.

## Security & Privacy
- No authentication layer currently; adding roles or auth should centralize user identity (do not rely only on localStorage for trust).
- Clipboard operations must remain user initiated.

## Refactoring Opportunities (Optional)
- Replace boolean effect cleanup flags with actual unsubscribe functions from Firestore snapshot listeners.
- Encapsulate status derivation into a pure state machine helper if adding more statuses.
- Introduce batch writes for game & players deletion for efficiency.

## When Writing New Code
Do:
- Route UI -> service -> repository (never UI -> repository directly).
- Add explicit return types to service functions.
- Add unit or component tests for new logic paths.
- Keep styling inline via Tailwind; reuse existing patterns.
- Check moderator permissions via `isModerator` for any privileged action.

Avoid:
- Introducing new global state libraries (Redux, Zustand) without strong justification.
- Mixing Firestore SDK styles (v8 + modular v9) piecemeal.
- Hardcoding status strings.
- Adding unscoped side effects in components.

## Suggested Future Tests
- `autoReveal` triggers finish exactly once when all players Finished.
- Average calculation with mixed custom numeric and special cards.
- `removeOldGameFromStore` logic with mocked timestamps.
- Moderator privilege when `isAllowMembersToManageSession` toggled mid-session.

## Summary Mental Model
UI (pages/components) => service layer (business workflows) => repository (Firestore/localStorage) => Firestore realtime updates drive UI; localStorage maintains lightweight session membership cache; enumerated game types define deck + average visibility; moderator privileges gate control actions.

Keep contributions incremental, typed, and test-backed.
