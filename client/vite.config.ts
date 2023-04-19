import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  return {
    build: { target: "esnext", rollupOptions: { external: ["@hathora/hathora-cloud-sdk", "typescript-memoize"] } },
    publicDir: "src/assets",
    server: { host: "0.0.0.0" },
    clearScreen: false,
    define: {
      "process.env": {
        HATHORA_APP_ID: process.env.HATHORA_APP_ID ?? env.HATHORA_APP_ID,
        HATHORA_API_HOST: process.env.HATHORA_API_HOST ?? env.HATHORA_API_HOST,
      },
    },
  };
});
