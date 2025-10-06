/*
 Registry fetcher tests
 Tests for npm package fetching and caching
*/

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { cleanup, fetchLatestVersions } from "../lib/core/fetcher";

describe("fetcher", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("fetchLatestVersions", () => {
    it("should fetch latest versions for valid packages", async () => {
      const packages = ["react", "typescript"];
      const results = await fetchLatestVersions(packages);

      expect(results).toBeDefined();
      expect(typeof results).toBe("object");

      const resultKeys = Object.keys(results);
      expect(resultKeys.length).toBeGreaterThan(0);

      for (const [name, version] of Object.entries(results)) {
        expect(name).toBeDefined();
        expect(version).toBeDefined();
        expect(typeof version).toBe("string");
        expect(version).toMatch(/^\d+\.\d+\.\d+/);
      }
    });

    it("should handle empty package list", async () => {
      const results = await fetchLatestVersions([]);
      expect(results).toEqual({});
    });

    it("should handle non-existent packages gracefully", async () => {
      const packages = ["this-package-does-not-exist-12345"];
      const results = await fetchLatestVersions(packages);

      expect(results).toEqual({});
    });

    it("should handle mixed valid and invalid packages", async () => {
      const packages = [
        "react",
        "this-package-does-not-exist-12345",
        "typescript",
      ];
      const results = await fetchLatestVersions(packages);

      expect(Object.keys(results).length).toBeGreaterThan(0);
      expect(results["react"]).toBeDefined();
      expect(results["typescript"]).toBeDefined();
      expect(results["this-package-does-not-exist-12345"]).toBeUndefined();
    });
  });
});
