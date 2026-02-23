import type { Scenario } from './index.ts';

export const filesScenario: Scenario = {
  id: 'files',
  title: 'Files',
  prompt: '❯',
  windowTitle: 'bash — ~/projects/webapp',
  commands: [
    {
      text: 'ls -la',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'total 128', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: 'drwxr-xr-x  12 user staff  384 Feb 17 08:30 ', class: '' },
          { text: '.', class: 'ansi-bold' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: '-rw-r--r--   1 user staff  842 Feb 17 08:15 ', class: '' },
          { text: 'package.json', class: '' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: '-rw-r--r--   1 user staff  291 Feb 16 14:22 ', class: '' },
          { text: 'tsconfig.json', class: '' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: 'drwxr-xr-x   8 user staff  256 Feb 17 08:30 ', class: '' },
          { text: 'src/', class: 'ansi-blue' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: 'drwxr-xr-x 412 user staff 13K  Feb 17 08:20 ', class: '' },
          { text: 'node_modules/', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: '-rwxr-xr-x   1 user staff  512 Feb 15 10:00 ', class: '' },
          { text: 'deploy.sh', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 80, tokens: [
          { text: 'lrwxr-xr-x   1 user staff   18 Feb 14 09:00 ', class: '' },
          { text: '.env', class: 'ansi-cyan' },
          { text: ' -> ', class: '' },
          { text: '.env.development', class: 'ansi-cyan' },
        ]},
      ],
    },
    {
      text: 'find . -name "*.ts" -not -path "./node_modules/*" | head -10',
      typeSpeed: 40,
      events: [
        { type: 'output', delay: 400, tokens: [{ text: './src/main.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/store/store.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/types/theme.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/color/oklch.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/color/contrast.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/ui/header.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/ui/preview.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/simulator/engine.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/simulator/renderer.ts', class: 'ansi-yellow' }] },
        { type: 'output', delay: 80, tokens: [{ text: './src/utils/dom.ts', class: 'ansi-yellow' }] },
      ],
    },
    {
      text: 'wc -l src/**/*.ts | tail -5',
      events: [
        { type: 'output', delay: 400, tokens: [
          { text: '   142', class: 'ansi-cyan' },
          { text: ' src/simulator/engine.ts', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '    89', class: 'ansi-cyan' },
          { text: ' src/simulator/renderer.ts', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '   201', class: 'ansi-cyan' },
          { text: ' src/ui/preview.ts', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '    34', class: 'ansi-cyan' },
          { text: ' src/utils/dom.ts', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  1847', class: 'ansi-bright-green' },
          { text: ' total', class: 'ansi-bold' },
        ]},
      ],
    },
  ],
};
