import type { Scenario } from './index.ts';

export const sshScenario: Scenario = {
  id: 'ssh',
  title: 'SSH',
  prompt: '❯',
  windowTitle: 'bash — ssh prod-server',
  commands: [
    {
      text: 'ssh deploy@prod-east-1',
      typeSpeed: 45,
      events: [
        { type: 'output', delay: 800, tokens: [
          { text: 'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.5.0-44-generic x86_64)', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, text: '' },
        { type: 'output', delay: 100, tokens: [
          { text: '  System load:  ', class: '' },
          { text: '0.42', class: 'ansi-green' },
          { text: '           Processes: ', class: '' },
          { text: '218', class: 'ansi-cyan' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  Memory usage: ', class: '' },
          { text: '67%', class: 'ansi-yellow' },
          { text: '            Disk usage: ', class: '' },
          { text: '43%', class: 'ansi-green' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '  Swap usage:   ', class: '' },
          { text: '0%', class: 'ansi-green' },
          { text: '             IPv4 addr: ', class: '' },
          { text: '10.0.1.47', class: 'ansi-cyan' },
        ]},
        { type: 'output', delay: 200, text: '' },
        { type: 'output', delay: 100, tokens: [
          { text: 'Last login: Mon Feb 17 06:12:45 2026 from 203.0.113.42', class: 'ansi-bright-black' },
        ]},
      ],
    },
    {
      text: 'systemctl status nginx',
      events: [
        { type: 'output', delay: 400, tokens: [
          { text: '● nginx.service', class: 'ansi-green' },
          { text: ' - A high performance web server', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '     Loaded: loaded (/lib/systemd/system/nginx.service; ', class: '' },
          { text: 'enabled', class: 'ansi-green' },
          { text: ')', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '     Active: ', class: '' },
          { text: 'active (running)', class: 'ansi-green' },
          { text: ' since Mon 2026-02-14 03:21:00 UTC; 3 days ago', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '    Process: ', class: '' },
          { text: '1842', class: 'ansi-cyan' },
          { text: ' ExecStart=/usr/sbin/nginx (code=exited, status=0/SUCCESS)', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '   Main PID: ', class: '' },
          { text: '1843', class: 'ansi-cyan' },
          { text: ' (nginx)', class: '' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '      Tasks: ', class: '' },
          { text: '5', class: 'ansi-cyan' },
          { text: ' (limit: 4915)', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 100, tokens: [
          { text: '     Memory: ', class: '' },
          { text: '12.4M', class: 'ansi-cyan' },
        ]},
      ],
    },
    {
      text: 'exit',
      events: [
        { type: 'output', delay: 300, tokens: [
          { text: 'logout', class: 'ansi-bright-black' },
        ]},
        { type: 'output', delay: 200, tokens: [
          { text: 'Connection to prod-east-1 closed.', class: '' },
        ]},
      ],
    },
  ],
};
