import semver from "semver";
import type { VerInfo } from "../types";

export function parseVer(versionRange: string): VerInfo {
  const cleanVersion = versionRange.replace(/^[\^~]/, "");

  if (!semver.valid(cleanVersion)) {
    throw new Error(`Invalid version: ${versionRange}`);
  }

  return {
    current: versionRange,
    latest: cleanVersion,
    range:
      versionRange.charAt(0) === "^"
        ? "caret"
        : versionRange.charAt(0) === "~"
        ? "tilde"
        : "exact",
    major: semver.major(cleanVersion),
    minor: semver.minor(cleanVersion),
    patch: semver.patch(cleanVersion),
  };
}

export function shouldUpdate(
  currentVer: string,
  latestVer: string,
  targetLevel: string
): boolean {
  if (!semver.valid(latestVer) || !semver.validRange(currentVer)) {
    return false;
  }

  const current = currentVer.replace(/^[\^~]/, "");

  if (semver.gte(current, latestVer)) {
    return false;
  }

  if (targetLevel === "auto" || !targetLevel) {
    return semver.lt(current, latestVer);
  }

  switch (targetLevel) {
    case "major":
      return semver.major(current) < semver.major(latestVer);
    case "minor":
      return (
        semver.minor(current) < semver.minor(latestVer) ||
        semver.major(current) < semver.major(latestVer)
      );
    case "patch":
      return (
        semver.patch(current) < semver.patch(latestVer) ||
        semver.minor(current) < semver.minor(latestVer) ||
        semver.major(current) < semver.major(latestVer)
      );
    default:
      return false;
  }
}

export function getUpdateLevel(
  currentVer: string,
  latestVer: string
): "major" | "minor" | "patch" {
  const current = currentVer.replace(/^[\^~]/, "");

  const majorDiff = semver.major(latestVer) - semver.major(current);
  const minorDiff = semver.minor(latestVer) - semver.minor(current);

  if (majorDiff > 0) return "major";
  if (minorDiff > 0) return "minor";
  return "patch";
}
