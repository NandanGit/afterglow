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
  type: 'output' | 'clear' | 'pause';
  text?: string;              // plain text (used if tokens not provided)
  tokens?: OutputToken[];     // rich colored output
  delay: number;              // ms before this event fires (at 1x speed)
}

export interface ScenarioCommand {
  text: string;              // command to type letter-by-letter, e.g., "git status"
  typeSpeed?: number;        // ms per char for typing animation (default: 50, scaled by speed)
  events: ScenarioEvent[];   // output events after this command
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  prompt: string;        // prompt prefix shown before each command, e.g., "❯" or "user@host:~$"
  windowTitle: string;   // title bar text, e.g., "bash — ~/projects"
  commands: ScenarioCommand[];  // commands simulated sequentially
}
```

### 4.2 Implement the LOGS Scenario (`src/simulator/scenarios/logs.ts`)

**This is the primary scenario and must match the mockup closely.**

This scenario should have multiple commands simulated sequentially. Each command is typed letter-by-letter before its output plays. Example commands:
1. `cd /var/log/app` → brief directory change acknowledgment
2. `tail -f server.log` → the main log output (bulk of the scenario)

The mockup shows `tail -f server.log` output with:
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

Create 8 more scenario files. Each should use **multiple commands** (2–4 per scenario), feel authentic, and showcase different ANSI colors. Every command is typed letter-by-letter before its output plays:

- **`git.ts`** — Commands: `git status`, `git log --oneline -5`, `git diff src/main.ts`. Show modified/staged/untracked in appropriate colors.
- **`python.ts`** — Commands: `python3`, `import math`, `math.sqrt(144)`, then a script that produces a traceback. REPL-style multi-command flow.
- **`system.ts`** — Commands: `uptime`, `df -h`, `top -l 1 | head -20`. System stats with colored output.
- **`docker.ts`** — Commands: `docker ps`, `docker-compose up -d`, `docker logs api --tail 20`. Service startup logs.
- **`files.ts`** — Commands: `ls -la`, `find . -name "*.ts" | head -10`, `tree src/ -L 2`. Colored file types.
- **`build.ts`** — Commands: `npm run lint`, `npm run build`. Compilation steps, warnings, success message.
- **`ssh.ts`** — Commands: `ssh user@prod-server`, `systemctl status nginx`, `exit`. Remote session flow.
- **`all.ts`** — A curated mix of commands from other scenarios — the "highlight reel."

Each scenario should have 2–4 commands with 5–15 output events each, totaling ~30–60 seconds at 1x speed.

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

**Multi-command flow:**
- For each command in `scenario.commands[]`:
  1. Render the prompt text (`scenario.prompt`)
  2. Type out `command.text` letter-by-letter (`command.typeSpeed` ms per char, default 50, scaled by speed)
  3. Brief pause (200ms at 1x speed)
  4. Play all `command.events` sequentially with their delays
  5. Move to next command
- The command text must NOT appear instantly — each character is revealed one at a time

### 4.5 Implement the Terminal Renderer (`src/simulator/renderer.ts`)

```typescript
export class TerminalRenderer {
  private container: HTMLElement;
  private outputEl: HTMLElement;

  constructor(container: HTMLElement);

  renderEvent(event: ScenarioEvent, index: number): void;
  showPrompt(text: string): void;         // show blinking cursor at prompt
  typeCommand(text: string, speed: number): void;  // type command letter-by-letter at prompt
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
- Lucide `RotateCw` icon button, filled/colored when looping is on, dimmed/outlined when off
- Click → `store.toggleLooping()`

**Comparison toggle** (just the button for now — comparison view is Phase 7):
- Lucide `Columns2` icon (split-screen), dimmed by default
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
