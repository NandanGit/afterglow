export type ScenarioId = 'all' | 'git' | 'python' | 'node' | 'logs' | 'system' | 'docker' | 'files' | 'build' | 'ssh';

export interface OutputToken {
  text: string;
  class?: string;
}

export interface ScenarioEvent {
  type: 'output' | 'clear' | 'pause';
  text?: string;
  tokens?: OutputToken[];
  delay: number;
}

export interface ScenarioCommand {
  text: string;
  typeSpeed?: number;
  prompt?: string;
  events: ScenarioEvent[];
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  prompt: string;
  windowTitle: string;
  commands: ScenarioCommand[];
}

import { logsScenario } from './logs.ts';
import { gitScenario } from './git.ts';
import { pythonScenario } from './python.ts';
import { nodeScenario } from './node.ts';
import { systemScenario } from './system.ts';
import { dockerScenario } from './docker.ts';
import { filesScenario } from './files.ts';
import { buildScenario } from './build.ts';
import { sshScenario } from './ssh.ts';

const individualScenarios: Scenario[] = [
  logsScenario, gitScenario, pythonScenario, nodeScenario, systemScenario,
  dockerScenario, filesScenario, buildScenario, sshScenario,
];

// "All" scenario combines commands from every scenario
const allScenario: Scenario = {
  id: 'all',
  title: 'All',
  prompt: '❯',
  windowTitle: 'bash — ~/projects',
  commands: individualScenarios.flatMap(s => s.commands),
};

export const scenarios: Record<ScenarioId, Scenario> = {
  all: allScenario,
  git: gitScenario,
  python: pythonScenario,
  node: nodeScenario,
  logs: logsScenario,
  system: systemScenario,
  docker: dockerScenario,
  files: filesScenario,
  build: buildScenario,
  ssh: sshScenario,
};
