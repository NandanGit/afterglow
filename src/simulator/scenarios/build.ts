import type { Scenario } from './index.ts';

export const buildScenario: Scenario = {
  id: 'build',
  title: 'Build',
  prompt: '❯',
  windowTitle: 'bash — npm run build',
  commands: [
    {
      text: 'npm run lint',
      events: [
        { type: 'output', delay: 500, tokens: [
          { text: '> webapp@1.0.0 lint', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 300, tokens: [
          { text: '> eslint src/ --ext .ts,.tsx', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 800, text: '' },
        { type: 'output', delay: 200, tokens: [
          { text: 'src/utils/format.ts', class: 'ansi-cyan' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  14:7', class: 'ansi-bright-black' },
          { text: '  warning', class: 'ansi-yellow' },
          { text: '  Unexpected any. Specify a different type', class: '' },
          { text: '  @typescript-eslint/no-explicit-any', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  28:3', class: 'ansi-bright-black' },
          { text: '  warning', class: 'ansi-yellow' },
          { text: '  \'result\' is assigned but never used', class: '' },
          { text: '  @typescript-eslint/no-unused-vars', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, text: '' },
        { type: 'output', delay: 100, tokens: [
          { text: '✖ 2 problems (0 errors, 2 warnings)', class: 'ansi-yellow' },
        ]},
      ],
    },
    {
      text: 'npm run build',
      events: [
        { type: 'output', delay: 500, tokens: [
          { text: '> webapp@1.0.0 build', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '> tsc && vite build', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 1200, tokens: [
          { text: 'vite v6.1.0', class: 'ansi-magenta' },
          { text: ' building for production...', class: '' },
        ]},
        { type: 'output', delay: 600, tokens: [
          { text: '✓', class: 'ansi-green' },
          { text: ' 247 modules transformed.', class: '' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: 'dist/index.html          ', class: '' },
          { text: '0.67 kB', class: 'ansi-bright-black' },
          { text: ' │ gzip: ', class: 'ansi-bright-black' },
          { text: '0.38 kB', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'dist/assets/index.css    ', class: '' },
          { text: '4.21 kB', class: 'ansi-bright-black' },
          { text: ' │ gzip: ', class: 'ansi-bright-black' },
          { text: '1.42 kB', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'dist/assets/index.js    ', class: '' },
          { text: '18.73 kB', class: 'ansi-bright-black' },
          { text: ' │ gzip: ', class: 'ansi-bright-black' },
          { text: '6.89 kB', class: '' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: '✓', class: 'ansi-green' },
          { text: ' built in ', class: '' },
          { text: '1.24s', class: 'ansi-cyan' },
        ]},
      ],
    },
  ],
};
