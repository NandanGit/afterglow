import type { Scenario, ScenarioEvent } from './scenarios/index.ts';

interface EngineCallbacks {
  onPrompt: (prompt: string) => void;
  onTypeChar: (char: string) => void;
  onOutputLine: (event: ScenarioEvent) => void;
  onComplete: () => void;
  onClear: () => void;
  onFinishCommand: () => void;
}

// Flattened step types for the unified timeline
type Step =
  | { kind: 'prompt'; prompt: string }
  | { kind: 'char'; char: string; delay: number }
  | { kind: 'post-type-pause'; delay: number }
  | { kind: 'finish-command' }
  | { kind: 'output-line'; event: ScenarioEvent };

export class SimulatorEngine {
  private steps: Step[] = [];
  private stepIndex = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private timeoutSetAt = 0;
  private currentStepDelay = 0;
  private speed = 1;
  private looping = true;
  private paused = false;
  private callbacks: EngineCallbacks;

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  load(scenario: Scenario): void {
    this.cancel();
    this.steps = this.flatten(scenario);
    this.stepIndex = 0;
    this.paused = false;
  }

  play(): void {
    this.paused = false;
    this.executeStep();
  }

  pause(): void {
    this.paused = true;
    this.cancel();
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.executeStep();
  }

  reset(): void {
    this.cancel();
    this.stepIndex = 0;
    this.paused = false;
  }

  setSpeed(speed: number): void {
    if (speed === 0) {
      this.pause();
      return;
    }
    const wasPaused = this.paused;
    const oldSpeed = this.speed;
    this.speed = speed;

    if (wasPaused) {
      this.resume();
      return;
    }

    if (this.timeoutId !== null) {
      const elapsed = performance.now() - this.timeoutSetAt;
      const originalDelay = this.currentStepDelay / (1 / oldSpeed);
      const remaining = Math.max(0, originalDelay - elapsed);
      const newRemaining = remaining * (oldSpeed / speed);
      this.cancel();
      this.scheduleNext(newRemaining);
    }
  }

  setLooping(looping: boolean): void {
    this.looping = looping;
  }

  destroy(): void {
    this.cancel();
    this.steps = [];
  }

  // --- Internal ---

  private flatten(scenario: Scenario): Step[] {
    const steps: Step[] = [];
    for (const cmd of scenario.commands) {
      steps.push({ kind: 'prompt', prompt: cmd.prompt ?? scenario.prompt });
      const typeSpeed = cmd.typeSpeed ?? 50;
      for (const char of cmd.text) {
        steps.push({ kind: 'char', char, delay: typeSpeed });
      }
      steps.push({ kind: 'post-type-pause', delay: 200 });
      steps.push({ kind: 'finish-command' });

      for (const event of cmd.events) {
        if (event.type === 'pause') continue;
        steps.push({ kind: 'output-line', event });
      }
    }
    return steps;
  }

  private executeStep(): void {
    if (this.paused) return;
    if (this.stepIndex >= this.steps.length) {
      if (this.looping) {
        const loopDelay = 2000 / this.speed;
        this.timeoutId = setTimeout(() => {
          this.stepIndex = 0;
          this.callbacks.onClear();
          this.play();
        }, loopDelay);
      } else {
        this.callbacks.onComplete();
      }
      return;
    }

    const step = this.steps[this.stepIndex];

    switch (step.kind) {
      case 'prompt':
        this.callbacks.onPrompt(step.prompt);
        this.stepIndex++;
        this.executeStep();
        break;

      case 'char':
        this.currentStepDelay = step.delay / this.speed;
        this.scheduleNext(this.currentStepDelay, () => {
          this.callbacks.onTypeChar(step.char);
        });
        break;

      case 'post-type-pause':
        this.currentStepDelay = step.delay / this.speed;
        this.scheduleNext(this.currentStepDelay);
        break;

      case 'finish-command':
        this.callbacks.onFinishCommand();
        this.stepIndex++;
        this.executeStep();
        break;

      case 'output-line':
        this.currentStepDelay = step.event.delay / this.speed;
        this.scheduleNext(this.currentStepDelay, () => {
          this.callbacks.onOutputLine(step.event);
        });
        break;
    }
  }

  private scheduleNext(delay: number, beforeAdvance?: () => void): void {
    this.timeoutSetAt = performance.now();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      if (beforeAdvance) beforeAdvance();
      this.stepIndex++;
      this.executeStep();
    }, delay);
  }

  private cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
