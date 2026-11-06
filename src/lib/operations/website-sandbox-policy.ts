export class WebsiteSandboxUnavailableError extends Error {
  constructor(message = 'Vercel Sandbox is not configured. Provide VERCEL_OIDC_TOKEN or the complete VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID set.') {
    super(message);
    this.name = 'WebsiteSandboxUnavailableError';
  }
}

export function websiteSandboxBlocker(env: NodeJS.ProcessEnv = process.env) {
  if (env.VERCEL_OIDC_TOKEN) return null;
  if (env.VERCEL_TOKEN && env.VERCEL_TEAM_ID && env.VERCEL_PROJECT_ID) return null;
  return 'Vercel Sandbox is not configured. Provide VERCEL_OIDC_TOKEN or the complete VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID set.';
}