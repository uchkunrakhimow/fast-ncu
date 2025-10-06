export interface Update {
  name: string;
  current: string;
  latest: string;
  diff: string;
  type: "major" | "minor" | "patch";
}

export interface Options {
  upgrade?: boolean;
  filter?: string;
  json?: boolean;
  target?: string;
  workspaces?: string;
}

export interface WorkspacePackage {
  name: string;
  path: string;
  packageJson: Record<string, unknown>;
}

export interface Results {
  updates: Update[];
  total: number;
  upgraded: boolean;
  workspaces?: WorkspaceResult[];
}

export interface WorkspaceResult {
  name: string;
  path: string;
  updates: Update[];
}

export interface PkgInfo {
  name: string;
  "dist-tags": {
    latest: string;
    [key: string]: string;
  };
  versions: {
    [version: string]: {
      name: string;
      version: string;
    };
  };
}

export interface PkgManager {
  name: "npm" | "yarn" | "pnpm" | "bun";
  installCommand: string;
  lockFile: string;
}

export interface VerInfo {
  current: string;
  latest: string;
  range: string;
  major: number;
  minor: number;
  patch: number;
}
