import type { Scenario } from './index.ts';

export const nodeScenario: Scenario = {
  id: 'node',
  title: 'Node',
  prompt: '❯',
  windowTitle: 'bash — ~/projects/api',
  commands: [
    {
      text: 'node',
      events: [
        {
          type: 'output',
          delay: 400,
          tokens: [
            { text: 'Welcome to Node.js ', class: '' },
            { text: 'v22.11.0', class: 'ansi-green' },
            { text: '.', class: '' },
          ],
        },
        {
          type: 'output',
          delay: 100,
          tokens: [
            { text: 'Type ', class: 'ansi-bright-black' },
            { text: '".help"', class: 'ansi-cyan' },
            { text: ' for more information.', class: 'ansi-bright-black' },
          ],
        },
      ],
    },
    {
      prompt: '>',
      text: 'const fib = n => n <= 1 ? n : fib(n-1) + fib(n-2)',
      typeSpeed: 30,
      events: [
        {
          type: 'output',
          delay: 200,
          tokens: [{ text: 'undefined', class: 'ansi-bright-black' }],
        },
      ],
    },
    {
      prompt: '>',
      text: 'Array.from({length: 10}, (_, i) => fib(i))',
      typeSpeed: 30,
      events: [
        {
          type: 'output',
          delay: 300,
          tokens: [
            { text: '[', class: '' },
            { text: '  0,  1,  1,  2,  3,', class: 'ansi-cyan' },
            { text: '  5,  8, 13, 21,', class: 'ansi-cyan' },
            { text: ' 34', class: 'ansi-cyan' },
            { text: ' ]', class: '' },
          ],
        },
      ],
    },
    {
      prompt: '>',
      text: 'JSON.parse(\'{"user":"alice","roles":["admin","editor"]}\')',
      typeSpeed: 30,
      events: [
        {
          type: 'output',
          delay: 300,
          tokens: [
            { text: '{', class: '' },
            { text: ' user: ', class: '' },
            { text: "'alice'", class: 'ansi-green' },
            { text: ', roles: [ ', class: '' },
            { text: "'admin'", class: 'ansi-green' },
            { text: ', ', class: '' },
            { text: "'editor'", class: 'ansi-green' },
            { text: ' ] }', class: '' },
          ],
        },
      ],
    },
    {
      prompt: '>',
      text: 'null.toString()',
      typeSpeed: 40,
      events: [
        {
          type: 'output',
          delay: 200,
          tokens: [
            { text: 'Uncaught TypeError: ', class: 'ansi-red' },
            { text: "Cannot read properties of null (reading 'toString')", class: '' },
          ],
        },
      ],
    },
    {
      prompt: '>',
      text: '.exit',
      typeSpeed: 60,
      events: [],
    },
    {
      text: 'node -e "console.log(process.version)"',
      typeSpeed: 45,
      events: [
        {
          type: 'output',
          delay: 300,
          tokens: [{ text: 'v22.11.0', class: 'ansi-green' }],
        },
      ],
    },
  ],
};
