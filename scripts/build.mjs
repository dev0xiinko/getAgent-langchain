// Production build: bundle the TypeScript ESM server into a single dist/index.js.
//
// Why esbuild and not `tsc --emit`: the source uses extensionless ESM imports
// (`./config`), which Node's native ESM loader rejects at runtime. esbuild resolves
// those at build time, so we ship plain runnable JS with no tsx in production.
// Type-checking stays with `tsc --noEmit` (run separately in `npm run check`/CI).
//
// `--packages=external` keeps node_modules out of the bundle (no native-binary or
// dynamic-require surprises from mongoose/langchain/pdf-parse); they resolve from
// the production `node_modules` at runtime.
import { build } from "esbuild";
import { rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  packages: "external",
  sourcemap: true,
  logLevel: "info",
  // Bridge CJS interop shims some deps expect under ESM output.
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
});

console.log("[build] wrote dist/index.js");
