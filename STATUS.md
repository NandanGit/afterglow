# Terminal Theme Builder — Project Status

## Current Phase: Not Started

## Phase Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Foundation | ⬜ Not Started | Boilerplate cleanup, deps, types, OKLCH utils, store, CSS, DOM helpers |
| 2. Theme Data | ⬜ Not Started | 16 theme JSONs, registry, bundled imports, main.ts entry |
| 3. Core UI | ⬜ Not Started | Header, palette strip, color display |
| 4. Terminal Simulator | ⬜ Not Started | Scenarios, engine, renderer, preview panel |
| 5. Custom Builder | ⬜ Not Started | Palette generator, derivation, builder UI |
| 6. Export | ⬜ Not Started | Plist encoder, serializers, exporter, guide modal |
| 7. Additional Features | ⬜ Not Started | Comparison, URL sharing, community, search, WCAG, fonts, shortcuts, ambient, favorites |
| 8. Polish | ⬜ Not Started | Visual QA, transitions, edge cases, testing |

## Completion Legend
- ⬜ Not Started
- 🟡 In Progress
- ✅ Done
- 🔴 Blocked

## Notes
- Each phase has a detailed instruction file in `agent/` (e.g., `agent/phase-1.md`)
- Phases must be completed in order (each depends on the previous)
- The full architectural plan is in `agent/PLAN.md`
- Always run `npm run dev` during development so changes are visible live
