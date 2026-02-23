import type { Scenario } from './index.ts';

export const gitScenario: Scenario = {
  id: 'git',
  title: 'Git',
  prompt: '❯',
  windowTitle: 'bash — ~/projects/webapp',
  commands: [
    {
      text: 'git status',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'On branch ', class: '' },
          { text: 'feature/auth', class: 'ansi-cyan' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'Changes to be committed:', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  modified:   ', class: 'ansi-green' },
          { text: 'src/auth/login.ts', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  new file:   ', class: 'ansi-green' },
          { text: 'src/auth/oauth.ts', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, text: '' },
        { type: 'output', delay: 100, tokens: [
          { text: 'Changes not staged for commit:', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  modified:   ', class: 'ansi-red' },
          { text: 'src/middleware/cors.ts', class: 'ansi-red' },
        ]},
        { type: 'output', delay: 100, text: '' },
        { type: 'output', delay: 100, tokens: [
          { text: 'Untracked files:', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  ', class: '' },
          { text: 'src/auth/__tests__/', class: 'ansi-red' },
        ]},
      ],
    },
    {
      text: 'git log --oneline -5',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'a3f2c9e', class: 'ansi-yellow' },
          { text: ' ', class: '' },
          { text: '(HEAD -> feature/auth)', class: 'ansi-cyan' },
          { text: ' Add OAuth2 provider', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'b7d1e4a', class: 'ansi-yellow' },
          { text: ' Refactor login flow', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'c8a0f3b', class: 'ansi-yellow' },
          { text: ' ', class: '' },
          { text: '(origin/main)', class: 'ansi-green' },
          { text: ' Update dependencies', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'd9b2a1c', class: 'ansi-yellow' },
          { text: ' Fix CORS headers', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'e0c3b2d', class: 'ansi-yellow' },
          { text: ' Add rate limiting', class: '' },
        ]},
      ],
    },
    {
      text: 'git diff src/middleware/cors.ts',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'diff --git a/src/middleware/cors.ts b/src/middleware/cors.ts', class: 'ansi-bold' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '--- a/src/middleware/cors.ts', class: 'ansi-red' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '+++ b/src/middleware/cors.ts', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '@@ -12,7 +12,9 @@', class: 'ansi-cyan' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '   origin: process.env.ALLOWED_ORIGIN,', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '-  credentials: false,', class: 'ansi-red' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '+  credentials: true,', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '+  maxAge: 86400,', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '   methods: [\'GET\', \'POST\', \'PUT\'],', class: '' },
        ]},
      ],
    },
  ],
};
