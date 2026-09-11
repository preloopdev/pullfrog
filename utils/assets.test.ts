import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadAssetsInMarkdown } from "./assets.ts";

const savedServerUrl = process.env.GITHUB_SERVER_URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (savedServerUrl === undefined) delete process.env.GITHUB_SERVER_URL;
  else process.env.GITHUB_SERVER_URL = savedServerUrl;
});

describe("downloadAssetsInMarkdown", () => {
  it("recognizes and authenticates assets hosted by the configured server", async () => {
    process.env.GITHUB_SERVER_URL = "https://github.example";
    const url = "https://github.example/user-attachments/assets/asset.png";
    const tempDir = mkdtempSync(join(tmpdir(), "pullfrog-assets-"));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("png-bytes", { status: 200, headers: { "content-type": "image/png" } })
    );

    try {
      const result = await downloadAssetsInMarkdown(`![asset](${url})`, tempDir, "gh-token");

      expect(result).not.toContain(url);
      expect(fetchMock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({ headers: { Authorization: "Bearer gh-token" } })
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
