import type { Scenario } from './index.ts';

export const systemScenario: Scenario = {
  id: 'system',
  title: 'System',
  prompt: '❯',
  windowTitle: 'bash — system monitoring',
  commands: [
    {
      text: 'uptime',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: ' 14:23  up ', class: '' },
          { text: '12 days, 7:41', class: 'ansi-cyan' },
          { text: ',  3 users,  load averages: ', class: '' },
          { text: '1.42 1.89 2.01', class: 'ansi-yellow' },
        ]},
      ],
    },
    {
      text: 'df -h',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'Filesystem      Size  Used  Avail Use%  Mounted on', class: 'ansi-bold' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '/dev/sda1       ', class: '' },
          { text: '256G', class: 'ansi-cyan' },
          { text: '  142G   114G  ', class: '' },
          { text: '56%', class: 'ansi-green' },
          { text: '  /', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '/dev/sdb1       ', class: '' },
          { text: '1.0T', class: 'ansi-cyan' },
          { text: '  873G   127G  ', class: '' },
          { text: '87%', class: 'ansi-yellow' },
          { text: '  /data', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'tmpfs           ', class: '' },
          { text: ' 16G', class: 'ansi-cyan' },
          { text: '  4.2G    12G  ', class: '' },
          { text: '26%', class: 'ansi-green' },
          { text: '  /tmp', class: '' },
        ]},
      ],
    },
    {
      text: 'free -h',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: '              total    used    free   shared  buff/cache  available', class: 'ansi-bold' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'Mem:          ', class: '' },
          { text: ' 32Gi', class: 'ansi-cyan' },
          { text: '    18Gi', class: 'ansi-yellow' },
          { text: '    4.2Gi', class: 'ansi-green' },
          { text: '    512Mi     9.8Gi      12Gi', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: 'Swap:         ', class: '' },
          { text: '  8Gi', class: 'ansi-cyan' },
          { text: '    1.1Gi', class: '' },
          { text: '    6.9Gi', class: 'ansi-green' },
        ]},
      ],
    },
  ],
};
