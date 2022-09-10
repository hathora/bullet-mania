import hash from "hash.js";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  const appSecret = process.env.APP_SECRET ?? env.APP_SECRET;
  process.env.APP_ID = hash.sha256().update(appSecret).digest("hex");
  return {
    build: { target: "esnext", assetsInlineLimit: 0 },
    base: "",
    envDir: "../",
    envPrefix: "APP_ID",
    publicDir: "src/assets",
    server: { host: "0.0.0.0" },
    clearScreen: false,
  };
});
