# Phase 4: Terminal Simulator

> **Prerequisites**: Phase 3 (Core UI) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 4 to ✅

## Overview

Build the live terminal preview: the simulator engine that plays declarative scenario scripts, the DOM renderer that writes colored terminal output, the scenario tab UI, speed/loop controls, and all 9 scenarios.

## Before You Start

1. Ensure `npm run dev` is running
2. Reference the mockup (`theme-builder-mockup.jpeg`) — the left panel shows the LOGS scenario
3. Check `STATUS.md` confirms Phase 3 is ✅

## Tasks

### 4.1 Define Scenario Types (`src/simulator/scenarios/index.ts`)

```typescript
export type ScenarioId = 'all' | 'git' | 'python' | 'logs' | 'system' | 'docker' | 'files' | 'build' | 'ssh';

export interface OutputToken {
  text: string;
  class?: string;  // CSS class: 'ansi-red', 'ansi-bright-green', 'dim', 'bold', etc.
}

export interface ScenarioEvent {
  type: 'output' | 'input' | 'clear' | 'pause';
  text?: string;              // plain text (used if tokens not provided)
  tokens?: OutputToken[];     // rich colored output
  delay: number;              // ms before this event fires (at 1x speed)
  typeSpeed?: number;         // ms per character for 'input' type (typing animation)
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  prompt: string;    // title bar text, e.g., "bash — tail -f server.log"
  command: string;   // the command shown being typed, e.g., "tail -f /var/log/app/server.log"
  events: ScenarioEvent[];
}
```

### 4.2 Implement the LOGS Scenario (`src/simulator/scenarios/logs.ts`)

**This is the primary scenario and must match the mockup closely.**

The mockup shows a `tail -f server.log` output with:
- Timestamps (dim), log levels (INFO=green, DEBUG=blue, WARN=yellow, ERROR=red), messages
- A narrative arc: server starts → connections established → health checks → auth request → rate limit warning → DB timeout cascade (3 retries) → fatal error → exception with stack trace → circuit breaker → recovery

Create this as a `ScenarioEvent[]` with realistic delays between lines (200–800ms at 1x speed). Use `OutputToken[]` for colored output:

```typescript
{
  type: 'output',
  delay: 400,
  tokens: [
    { text: '2026-02-17 08:41:22.104', class: 'dim' },
    { text: '  INFO', class: 'ansi-green' },
    { text: '    Server started on ', class: '' },
    { text: '0.0.0.0:8080', class: 'ansi-cyan' },
    { text: ' [pid=27401]', class: 'dim' },
  ]
}
```

### 4.3 Implement Remaining Scenarios

Create 8 more scenario files. Each should feel authentic and showcase different ANSI colors:

- **`git.ts`** — `git status`, `git log --oneline`, `git diff` output. Show modified/staged/untracked files in appropriate colors.
- **`python.ts`** — Python REPL session. Import statements, calculations, a traceback with colored error.
- **`system.ts`** — `htop`-like system stats, `df -h` disk usage, `uptime` output.
- **`docker.ts`** — `docker ps`, `docker-compose up` with service startup logs.
- **`files.ts`** — `ls -la` with colored file types, `find` results, `tree` output.
- **`build.ts`** — `npm run build` or `cargo build` with compilation steps, warnings, success message.
- **`ssh.ts`** — SSH connection sequence, remote command execution, connection close.
- **`all.ts`** — A curated mix of snippets from the other scenarios — the "highlight reel."

Each scenario should be 15–30 events long, take ~30–60 seconds at 1x speed.

### 4.4 Implement the Simulator Engine (`src/simulator/engine.ts`)

```typescript
export class SimulatorEngine {
  private scenario: Scenario | null = null;
  private eventIndex = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastEventTime = 0;
  private speed = 1;
  private looping = true;
  private onEvent: (event: ScenarioEvent, index: number) => void;
  private onComplete: () => void;

  constructor(callbacks: {
    onEvent: (event: ScenarioEvent, index: number) => void;
    onComplete: () => void;
  });

  load(scenario: Scenario): void;
  play(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  setSpeed(speed: number): void;   // 0 = pause, 0.1–3.0
  setLooping(looping: boolean): void;
  destroy(): void;
}
```

**Speed change handling:**
1. When `setSpeed` is called mid-playback:
   - Cancel the current `setTimeout`
   - Calculate how much time has elapsed since the timeout was set
   - Calculate remaining delay at the new speed
   - Reschedule with the adjusted remaining time
2. If speed is set to 0, act as `pause()`
3. If speed changes from 0 to >0, act as `resume()`

**Loop handling:**
- After last event, if `looping` is true: wait 2 seconds (scaled by speed), then `reset()` + `play()`
- If `looping` is false: call `onComplete()` — the renderer will show a blinking cursor at prompt

**Input events (type: 'input'):**
- Characters appear one at a time with `typeSpeed` delay between them (also scaled by speed)
- After the full command is typed, a brief pause, then continue to next event

### 4.5 Implement the Terminal Renderer (`src/simulator/renderer.ts`)

```typescript
export class TerminalRenderer {
  private container: HTMLElement;
  private outputEl: HTMLElement;

  constructor(container: HTMLElement);

  renderEvent(event: ScenarioEvent, index: number): void;
  showPrompt(text: string): void;         // show blinking cursor at prompt
  showCommand(command: string): void;     // show the initial command in title
  clear(): void;
  setFontSize(size: number): void;
  setFontFamily(family: string): void;
  destroy(): void;
}
```

**Rendering rules:**
- Each `output` event creates a new `<div class="terminal-line">`
- Tokens within an event become `<span class="ansi-red">text</span>` etc.
- Plain text (no class) uses default foreground color
- Auto-scroll to bottom after each new line
- Terminal window chrome: traffic light dots (red/yellow/green circles) + title bar text (scenario prompt)
- Max visible lines: ~30; older lines scroll up naturally (CSS `overflow-y: auto` on the content area)
- When playback completes (not looping): show `❯ ` prompt with a blinking cursor (CSS animation)

### 4.6 Implement the Preview Panel UI (`src/ui/preview.ts`)

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [ALL] [GIT] [PYTHON] [LOGS] [SYSTEM] [DOCKER] [FILES] ... │
│                                              − 1.0x +  ⟳   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ● ● ●  bash — tail -f server.log                   │    │
│  │                                                     │    │
│  │ > tail -f /var/log/app/server.log                   │    │
│  │                                                     │    │
│  │ 2026-02-17 ...  INFO  Server started ...            │    │
│  │ ...                                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Scenario tabs:**
- Horizontal row of tab buttons matching mockup style
- Active tab has a filled/highlighted background
- Clicking a tab → `store.setActiveScenario(id)` → engine loads new scenario, renderer clears + restarts

**Speed control:**
- `−` button (decreases speed by 0.1, min 0)
- Speed display: `{speed}x` formatted to 1 decimal
- `+` button (increases speed by 0.1, max 3.0)
- Subscribe to `store.speed`

**Loop toggle:**
- `⟳` icon button, filled/colored when looping is on, dimmed/outlined when off
- Click → `store.toggleLooping()`

**Comparison toggle** (just the button for now — comparison view is Phase 7):
- Small split-screen icon, dimmed by default
- Click → `store.toggleComparison()` (functionality in Phase 7)

**Wiring:**
- Create `SimulatorEngine` and `TerminalRenderer` instances
- Subscribe to store for `activeScenario`, `speed`, `looping` changes
- On scenario change: `engine.load(scenarios[id])`, `renderer.clear()`, `engine.play()`
- On speed change: `engine.setSpeed(speed)`
- On looping change: `engine.setLooping(looping)`

**CSS for terminal window:**
- Dark background matching `var(--theme-background)`
- Rounded corners, subtle border/shadow
- Traffic light dots: three small circles (red `#FF5F57`, yellow `#FEBC2E`, green `#28C840`) — decorative only
- Monospace font (JetBrains Mono), line-height ~1.6
- Terminal content area: `overflow-y: auto`, `scrollbar-width: thin`

```typescript
export function mountPreview(container: HTMLElement): () => void;
```

### 4.7 Update `src/main.ts`

Mount the preview panel:
```typescript
import { mountPreview } from './ui/preview';
mountPreview(document.getElementById('preview')!);
```

## Verification

1. The LOGS scenario plays automatically on page load, matching the mockup's output
2. Tab switching loads different scenarios — each shows distinct colored content
3. Speed `−`/`+` buttons work, display updates (e.g., "1.2x"), animation speed visually changes
4. Speed 0 pauses the simulation; increasing from 0 resumes
5. Loop toggle works — when off, simulation freezes on last frame with blinking cursor
6. Terminal window has traffic light dots and title bar
7. Output auto-scrolls as new lines appear
8. Theme switching (via palette cards) instantly re-colors all terminal output without restart
9. `npm run build` succeeds

## Files Created/Modified

- **Created**: `src/simulator/engine.ts`, `src/simulator/renderer.ts`, `src/simulator/scenarios/index.ts`, `src/simulator/scenarios/logs.ts`, `src/simulator/scenarios/git.ts`, `src/simulator/scenarios/python.ts`, `src/simulator/scenarios/system.ts`, `src/simulator/scenarios/docker.ts`, `src/simulator/scenarios/files.ts`, `src/simulator/scenarios/build.ts`, `src/simulator/scenarios/ssh.ts`, `src/simulator/scenarios/all.ts`, `src/ui/preview.ts`
- **Modified**: `src/main.ts`, `src/style.css`, `src/store/store.ts` (add scenario/speed actions)
