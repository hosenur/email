import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rootDomain =
    env.VITE_ROOT_DOMAIN ||
    env.NEXT_PUBLIC_ROOT_DOMAIN ||
    env.ROOT_DOMAIN ||
    "localhost:3000";
  const rootHostname = rootDomain.split(":")[0].toLowerCase();
  const allowedHosts =
    rootHostname === "localhost" || rootHostname === "127.0.0.1"
      ? []
      : [rootHostname, `.${rootHostname}`];

  return {
    define: {
      __ROOT_DOMAIN__: JSON.stringify(rootDomain),
    },
    preview: {
      allowedHosts,
    },
    server: {
      allowedHosts,
    },
    plugins: [
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "./src/pages",
        generatedRouteTree: "./src/routeTree.gen.ts",
      }),
      tailwindcss(),
      react(),
      ...nitro({
        serverDir: "./src/server",
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
