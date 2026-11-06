import { defineConfig } from '@trigger.dev/sdk';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'proj_project-ref-required',
  dirs: ['./src/trigger'],
  runtime: 'node-22',
  maxDuration: 1800,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
      randomize: true,
    },
  },
});