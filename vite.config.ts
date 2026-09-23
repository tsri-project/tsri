import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl =
    env.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  const rawBuildTarget =
    env.BUILD_TARGET ||
    process.env.BUILD_TARGET ||
    (process.env.CF_PAGES_BRANCH === "main" ? "production" : (process.env.CF_PAGES_BRANCH ? "preview" : ""));
  
  const buildTarget = rawBuildTarget || "preview"; // Default to preview if omitted
  const isProdDb = supabaseUrl.includes("aatlledgsftkjfunqsvh");

  // Strict Dev Guard: Stop `npm run dev` immediately if pointing to Production DB
  if (isProdDb && (command === "serve" || mode === "development")) {
    throw new Error(
      `\n❌ [DEV GUARD FAILURE] Security Violation: Local development server ('npm run dev') is prohibited from running against Production DB.\n` +
      `   Local development MUST connect to an isolated Supabase Sandbox or local instance.\n`
    );
  }

  // Strict Guard 1: Require Supabase URL and Anon Key
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `\n❌ [BUILD GUARD FAILURE] Missing Required Environment Variables:\n` +
      `   Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined for build.\n`
    );
  }

  // Strict Guard 2: Block non-production builds (including preview, staging, or missing BUILD_TARGET) from pointing to Production DB
  if (isProdDb && buildTarget !== "production") {
    throw new Error(
      `\n❌ [BUILD GUARD FAILURE] Security Violation: Build target is '${buildTarget}' (not 'production'), but Supabase URL points to Production DB.\n` +
      `   Preview and Staging builds MUST connect to an isolated Supabase Sandbox.\n` +
      `   To build for production, you must explicitly set BUILD_TARGET=production.\n`
    );
  }

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
    },
    plugins: [
      remix({
        ssr: false,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
  };
});


