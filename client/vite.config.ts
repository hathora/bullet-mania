import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../", "");
  return {
    build: { target: "esnext" },
    publicDir: "src/assets",
    server: { host: "0.0.0.0" },
    clearScreen: false,
    define: {
      "process.env": {
        APP_ID: process.env.APP_ID ?? env.APP_ID,
        COORDINATOR_HOST: process.env.COORDINATOR_HOST ?? env.COORDINATOR_HOST,
      },
    },
  };
});
