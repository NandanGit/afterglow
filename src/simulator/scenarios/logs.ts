import type { Scenario } from './index.ts';

export const logsScenario: Scenario = {
  id: 'logs',
  title: 'Logs',
  prompt: '❯',
  windowTitle: 'bash — ~/projects/app',
  commands: [
    {
      text: 'cd /var/log/app',
      events: [],
    },
    {
      text: 'tail -f server.log',
      typeSpeed: 45,
      events: [
        {
          type: 'output', delay: 600,
          tokens: [
            { text: '2026-02-17 08:41:22.104', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Server started on ' },
            { text: '0.0.0.0:8080', class: 'ansi-cyan' },
            { text: ' [pid=27401]', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 400,
          tokens: [
            { text: '2026-02-17 08:41:22.218', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Loading config from ' },
            { text: '/etc/app/config.yml', class: 'ansi-cyan' },
          ],
        },
        {
          type: 'output', delay: 350,
          tokens: [
            { text: '2026-02-17 08:41:22.541', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Connection pool established — ' },
            { text: '10 active', class: 'ansi-bright-green' },
            { text: ', 0 idle', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 500,
          tokens: [
            { text: '2026-02-17 08:41:23.012', class: 'ansi-bright-black' },
            { text: '  DEBUG', class: 'ansi-blue' },
            { text: '   Health check ' },
            { text: '/healthz', class: 'ansi-cyan' },
            { text: ' → ' },
            { text: '200 OK', class: 'ansi-green' },
            { text: '  (2ms)', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 400,
          tokens: [
            { text: '2026-02-17 08:41:23.455', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Auth request from ' },
            { text: '192.168.1.42', class: 'ansi-yellow' },
            { text: ' — user=' },
            { text: 'admin', class: 'ansi-magenta' },
          ],
        },
        {
          type: 'output', delay: 300,
          tokens: [
            { text: '2026-02-17 08:41:23.602', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Session created: ' },
            { text: 'tok_a8f2c9e1', class: 'ansi-cyan' },
            { text: ' ttl=3600s', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 700,
          tokens: [
            { text: '2026-02-17 08:41:24.891', class: 'ansi-bright-black' },
            { text: '  WARN', class: 'ansi-yellow' },
            { text: '    Rate limit approaching for ' },
            { text: '192.168.1.42', class: 'ansi-yellow' },
            { text: ' — 847/1000 req/min', class: 'ansi-bright-yellow' },
          ],
        },
        {
          type: 'output', delay: 500,
          tokens: [
            { text: '2026-02-17 08:41:25.334', class: 'ansi-bright-black' },
            { text: '  ERROR', class: 'ansi-red' },
            { text: '   DB query timeout after ' },
            { text: '5000ms', class: 'ansi-bright-red' },
            { text: ' — retrying (1/3)', class: 'ansi-yellow' },
          ],
        },
        {
          type: 'output', delay: 600,
          tokens: [
            { text: '2026-02-17 08:41:25.891', class: 'ansi-bright-black' },
            { text: '  ERROR', class: 'ansi-red' },
            { text: '   DB query timeout after ' },
            { text: '5000ms', class: 'ansi-bright-red' },
            { text: ' — retrying (2/3)', class: 'ansi-yellow' },
          ],
        },
        {
          type: 'output', delay: 600,
          tokens: [
            { text: '2026-02-17 08:41:26.401', class: 'ansi-bright-black' },
            { text: '  ERROR', class: 'ansi-red' },
            { text: '   DB query timeout after ' },
            { text: '5000ms', class: 'ansi-bright-red' },
            { text: ' — retrying (3/3)', class: 'ansi-yellow' },
          ],
        },
        {
          type: 'output', delay: 400,
          tokens: [
            { text: '2026-02-17 08:41:26.912', class: 'ansi-bright-black' },
            { text: '  FATAL', class: 'ansi-bright-red' },
            { text: '   All retries exhausted — connection to ' },
            { text: 'db-primary:5432', class: 'ansi-red' },
            { text: ' lost', class: 'ansi-bright-red' },
          ],
        },
        {
          type: 'output', delay: 300,
          tokens: [
            { text: '', class: 'ansi-red' },
          ],
        },
        {
          type: 'output', delay: 200,
          tokens: [
            { text: '  ConnectionError: ETIMEDOUT', class: 'ansi-bright-red' },
          ],
        },
        {
          type: 'output', delay: 150,
          tokens: [
            { text: '    at Pool.connect (db/pool.ts:142)', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 150,
          tokens: [
            { text: '    at QueryRunner.execute (db/runner.ts:89)', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 150,
          tokens: [
            { text: '    at UserService.findById (services/user.ts:34)', class: 'ansi-bright-black' },
          ],
        },
        {
          type: 'output', delay: 500,
          tokens: [
            { text: '', class: 'ansi-red' },
          ],
        },
        {
          type: 'output', delay: 400,
          tokens: [
            { text: '2026-02-17 08:41:27.501', class: 'ansi-bright-black' },
            { text: '  WARN', class: 'ansi-yellow' },
            { text: '    Circuit breaker ' },
            { text: 'OPEN', class: 'ansi-bright-yellow' },
            { text: ' for db-primary — fallback to ' },
            { text: 'db-replica', class: 'ansi-cyan' },
          ],
        },
        {
          type: 'output', delay: 800,
          tokens: [
            { text: '2026-02-17 08:41:28.773', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Replica connection restored — ' },
            { text: 'queries resuming', class: 'ansi-bright-green' },
          ],
        },
        {
          type: 'output', delay: 400,
          tokens: [
            { text: '2026-02-17 08:41:29.102', class: 'ansi-bright-black' },
            { text: '  INFO', class: 'ansi-green' },
            { text: '    Health check ' },
            { text: '/healthz', class: 'ansi-cyan' },
            { text: ' → ' },
            { text: '200 OK', class: 'ansi-green' },
            { text: '  (4ms)', class: 'ansi-bright-black' },
          ],
        },
      ],
    },
  ],
};
