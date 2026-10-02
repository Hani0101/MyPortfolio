// Compresses every Blender export in assets/models into public/models with
// meshopt (one small decoder for all models, loaded with Three.js).
// Usage: npm run models
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const SOURCE = "assets/models";
const TARGET = "public/models";
// The package doesn't export its bin, so point at the file (npm scripts run from the repo root)
const cli = "node_modules/@gltf-transform/cli/bin/cli.js";

for (const file of readdirSync(SOURCE).filter((name) => name.endsWith(".glb"))) {
  execFileSync(process.execPath, [cli, "meshopt", path.join(SOURCE, file), path.join(TARGET, file)], { stdio: "inherit" });
}
