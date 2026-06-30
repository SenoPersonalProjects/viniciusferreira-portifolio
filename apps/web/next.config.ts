import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname, "../.."),
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
