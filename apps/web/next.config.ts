import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

const workspaceRoot = resolve(__dirname, "../..");

function loadWorkspacePublicEnv() {
  const envPath = resolve(workspaceRoot, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();

    if (!key.startsWith("NEXT_PUBLIC_") || process.env[key] !== undefined) {
      continue;
    }

    let value = trimmedLine.slice(separatorIndex + 1).trim();
    const firstChar = value.charAt(0);
    const lastChar = value.charAt(value.length - 1);

    if (
      value.length > 1 &&
      ((firstChar === '"' && lastChar === '"') ||
        (firstChar === "'" && lastChar === "'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadWorkspacePublicEnv();

const nextConfig: NextConfig = {
  turbopack: {
    root: workspaceRoot,
    resolveAlias: {
      three: "./src/lib/three-compat.mjs",
      "three/webgpu": "./src/lib/three-webgpu-compat.mjs",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "three$": resolve(__dirname, "src/lib/three-compat.mjs"),
      "three/webgpu$": resolve(
        __dirname,
        "src/lib/three-webgpu-compat.mjs",
      ),
    };

    return config;
  },
};

export default nextConfig;
