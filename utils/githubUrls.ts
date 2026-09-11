const DEFAULT_GITHUB_API_URL = "https://api.github.com";
const DEFAULT_GITHUB_SERVER_URL = "https://github.com";

function withoutTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function githubApiUrl(): string {
  return withoutTrailingSlashes(process.env.GITHUB_API_URL || DEFAULT_GITHUB_API_URL);
}

export function githubServerUrl(): string {
  return withoutTrailingSlashes(process.env.GITHUB_SERVER_URL || DEFAULT_GITHUB_SERVER_URL);
}

export function githubServerHost(): string {
  try {
    return new URL(githubServerUrl()).host;
  } catch {
    return "github.com";
  }
}

export function githubServerHostname(): string {
  try {
    return new URL(githubServerUrl()).hostname;
  } catch {
    return "github.com";
  }
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseOwnerRepo(path: string): { owner: string; repo: string } | null {
  const normalized = path.replace(/^\/+|\/+$/g, "").replace(/\.git$/, "");
  const match = normalized.match(/^([^/]+)\/([^/]+)$/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

/** Parses HTTPS/SSH and scp-style remotes for the configured GitHub host. */
export function parseGitHubRemote(remote: string): { owner: string; repo: string } | null {
  const scp = remote.match(/^git@([^:]+):(.+)$/);
  if (scp && scp[1] === githubServerHostname()) return parseOwnerRepo(scp[2]);

  try {
    const parsed = new URL(remote);
    if (parsed.hostname !== githubServerHostname()) return null;
    return parseOwnerRepo(parsed.pathname);
  } catch {
    return null;
  }
}
