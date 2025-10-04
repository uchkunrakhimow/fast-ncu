import { describe, expect, it } from "bun:test";
import { getUpdateLevel, parseVer, shouldUpdate } from "../lib/utils/ver";

describe("ver utils", () => {
  describe("parseVer", () => {
    it("should correctly parse version ranges", () => {
      const result = parseVer("^1.2.3");
      expect(result.current).toBe("^1.2.3");
      expect(result.latest).toBe("1.2.3");
      expect(result.range).toBe("caret");
      expect(result.major).toBe(1);
      expect(result.minor).toBe(2);
      expect(result.patch).toBe(3);
    });
  });

  describe("shouldUpdate", () => {
    it("should correctly determine if update is needed", () => {
      expect(shouldUpdate("^1.0.0", "1.1.0", "minor")).toBe(true);
      expect(shouldUpdate("^1.0.0", "2.0.0", "major")).toBe(true);
      expect(shouldUpdate("^1.0.0", "1.0.1", "patch")).toBe(true);
      expect(shouldUpdate("^1.0.0", "1.0.0", "minor")).toBe(false);
      expect(shouldUpdate("^1.0.0", "0.9.0", "minor")).toBe(false);
    });
  });

  describe("getUpdateLevel", () => {
    it("should correctly identify update level", () => {
      expect(getUpdateLevel("^1.0.0", "2.0.0")).toBe("major");
      expect(getUpdateLevel("^1.0.0", "1.1.0")).toBe("minor");
      expect(getUpdateLevel("^1.0.0", "1.0.1")).toBe("patch");
    });
  });
});
