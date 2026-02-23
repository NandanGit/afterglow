import type { Scenario } from './index.ts';

export const dockerScenario: Scenario = {
  id: 'docker',
  title: 'Docker',
  prompt: '❯',
  windowTitle: 'bash — docker',
  commands: [
    {
      text: 'docker ps',
      events: [
        { type: 'output', delay: 400, tokens: [
          { text: 'CONTAINER ID   IMAGE          STATUS          PORTS                    NAMES', class: 'ansi-bold' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'a1b2c3d4e5f6', class: 'ansi-cyan' },
          { text: '   nginx:1.25    ', class: '' },
          { text: 'Up 3 days', class: 'ansi-green' },
          { text: '       0.0.0.0:80->80       ', class: '' },
          { text: 'web', class: 'ansi-yellow' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'f6e5d4c3b2a1', class: 'ansi-cyan' },
          { text: '   node:20       ', class: '' },
          { text: 'Up 3 days', class: 'ansi-green' },
          { text: '       0.0.0.0:3000->3000   ', class: '' },
          { text: 'api', class: 'ansi-yellow' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '1a2b3c4d5e6f', class: 'ansi-cyan' },
          { text: '   postgres:16   ', class: '' },
          { text: 'Up 3 days', class: 'ansi-green' },
          { text: '       5432/tcp              ', class: '' },
          { text: 'db', class: 'ansi-yellow' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '6f5e4d3c2b1a', class: 'ansi-cyan' },
          { text: '   redis:7       ', class: '' },
          { text: 'Up 3 days', class: 'ansi-green' },
          { text: '       6379/tcp              ', class: '' },
          { text: 'cache', class: 'ansi-yellow' },
        ]},
      ],
    },
    {
      text: 'docker-compose up -d worker',
      events: [
        { type: 'output', delay: 500, tokens: [
          { text: '[+] Running 1/1', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 300, tokens: [
          { text: ' ✔ Container ', class: 'ansi-green' },
          { text: 'worker', class: 'ansi-cyan' },
          { text: '  Started', class: 'ansi-green' },
        ]},
      ],
    },
    {
      text: 'docker logs api --tail 10',
      events: [
        { type: 'output', delay: 400, tokens: [
          { text: '[2026-02-17T08:00:12Z]', class: 'ansi-bright-black' },
          { text: ' Listening on :3000', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '[2026-02-17T08:01:45Z]', class: 'ansi-bright-black' },
          { text: ' GET', class: 'ansi-blue' },
          { text: ' /api/users ', class: '' },
          { text: '200', class: 'ansi-green' },
          { text: ' 12ms', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '[2026-02-17T08:02:01Z]', class: 'ansi-bright-black' },
          { text: ' POST', class: 'ansi-yellow' },
          { text: ' /api/auth/login ', class: '' },
          { text: '200', class: 'ansi-green' },
          { text: ' 89ms', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '[2026-02-17T08:03:15Z]', class: 'ansi-bright-black' },
          { text: ' GET', class: 'ansi-blue' },
          { text: ' /api/dashboard ', class: '' },
          { text: '304', class: 'ansi-cyan' },
          { text: ' 3ms', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '[2026-02-17T08:04:22Z]', class: 'ansi-bright-black' },
          { text: ' PUT', class: 'ansi-magenta' },
          { text: ' /api/users/42 ', class: '' },
          { text: '401', class: 'ansi-red' },
          { text: ' 2ms', class: 'ansi-bright-black' },
        ]},
      ],
    },
  ],
};
