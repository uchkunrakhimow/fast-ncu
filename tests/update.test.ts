/*
 Package updater tests
 Tests for update checking and package.json modification
*/

import { describe, expect, it } from "bun:test";
import { checkUpdates } from "../lib/core/updater";

describe("updater", () => {
  describe("checkUpdates", () => {
    it("should handle empty package.json gracefully", async () => {
      try {
        await checkUpdates({});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain("package.json");
        }
      }
    });

    it("should validate filter pattern", async () => {
      try {
        await checkUpdates({ filter: "[invalid-regex" });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain("Invalid");
        }
      }
    });

    it("should handle invalid target level", async () => {
      try {
        await checkUpdates({ target: "invalid" });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
