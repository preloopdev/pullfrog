import { afterEach, describe, expect, it } from "vitest";
import {
  githubApiUrl,
  githubServerHost,
  githubServerHostname,
  githubServerUrl,
  parseGitHubRemote,
} from "./githubUrls.ts";

const savedApiUrl = process.env.GITHUB_API_URL;
const savedServerUrl = process.env.GITHUB_SERVER_URL;

afterEach(() => {
  if (savedApiUrl === undefined) delete process.env.GITHUB_API_URL;
  else process.env.GITHUB_API_URL = savedApiUrl;
  if (savedServerUrl === undefined) delete process.env.GITHUB_SERVER_URL;
  else process.env.GITHUB_SERVER_URL = savedServerUrl;
});

describe("GitHub URL helpers", () => {
  it("preserves GitHub.com defaults when Actions variables are unset", () => {
    delete process.env.GITHUB_API_URL;
    delete process.env.GITHUB_SERVER_URL;

    expect(githubApiUrl()).toBe("https://api.github.com");
    expect(githubServerUrl()).toBe("https://github.com");
    expect(githubServerHost()).toBe("github.com");
    expect(githubServerHostname()).toBe("github.com");
  });

  it("normalizes enterprise URLs and parses enterprise remotes", () => {
    process.env.GITHUB_API_URL = "https://github.example/api/v3///";
    process.env.GITHUB_SERVER_URL = "https://github.example///";

    expect(githubApiUrl()).toBe("https://github.example/api/v3");
    expect(githubServerUrl()).toBe("https://github.example");
    expect(parseGitHubRemote("https://github.example/preloop/pullfrog.git")).toEqual({
      owner: "preloop",
      repo: "pullfrog",
    });
    expect(parseGitHubRemote("git@github.example:preloop/pullfrog.git")).toEqual({
      owner: "preloop",
      repo: "pullfrog",
    });
    expect(parseGitHubRemote("https://github.com/preloop/pullfrog.git")).toBeNull();
  });
});
