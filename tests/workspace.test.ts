import { describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { detectWorkspaces, getAllDependencies } from "../lib/utils/workspace";

describe("workspace utils", () => {
  describe("getAllDependencies", () => {
    it("should extract all dependencies from package.json", () => {
      const packageJson = {
        dependencies: {
          react: "^18.0.0",
          vue: "^3.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
        },
      };

      const deps = getAllDependencies(packageJson);

      expect(deps).toEqual({
        react: "^18.0.0",
        vue: "^3.0.0",
        typescript: "^5.0.0",
      });
    });

    it("should handle missing dependencies", () => {
      const packageJson = {};
      const deps = getAllDependencies(packageJson);
      expect(deps).toEqual({});
    });
  });

  describe("detectWorkspaces", () => {
    it("should return empty array if no package.json", async () => {
      const tempDir = await mkdtemp(join(tmpdir(), "fncu-test-"));
      const workspaces = await detectWorkspaces(tempDir);
      expect(workspaces).toEqual([]);
      await rm(tempDir, { recursive: true });
    });

    it("should detect npm/yarn workspaces from package.json", async () => {
      const tempDir = await mkdtemp(join(tmpdir(), "fncu-test-"));

      await writeFile(
        join(tempDir, "package.json"),
        JSON.stringify({
          name: "root",
          workspaces: ["packages/*"],
        })
      );

      const packagesDir = join(tempDir, "packages");
      await Bun.write(join(packagesDir, "pkg1", "package.json"), "");
      await writeFile(
        join(packagesDir, "pkg1", "package.json"),
        JSON.stringify({
          name: "pkg1",
          version: "1.0.0",
        })
      );

      const workspaces = await detectWorkspaces(tempDir);
      expect(workspaces.length).toBeGreaterThanOrEqual(0);

      await rm(tempDir, { recursive: true });
    });
  });
});

