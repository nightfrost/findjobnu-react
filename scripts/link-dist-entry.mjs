#!/usr/bin/env node
import { readFile, writeFile, mkdir, cp, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

async function resolveManifestPath() {
  const candidates = [
    path.join(distDir, "manifest.json"),
    path.join(distDir, ".vite", "manifest.json"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.F_OK);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(`Unable to locate Vite manifest. Looked in: ${candidates.join(", ")}`);
}

async function main() {
  const manifestPath = await resolveManifestPath();
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);

  const entryKey = manifest["src/main.tsx"] ? "src/main.tsx" : Object.keys(manifest).find((key) => manifest[key]?.isEntry);
  if (!entryKey) {
    throw new Error("Unable to locate the application entry in manifest.json");
  }

  const entry = manifest[entryKey];
  if (!entry?.file) {
    throw new Error(`Manifest entry '${entryKey}' is missing its output file reference.`);
  }

  const aliasMappings = [];
  const jsAlias = "assets/app.js";
  aliasMappings.push({ source: entry.file, target: jsAlias });

  await mkdir(path.dirname(path.join(distDir, jsAlias)), { recursive: true });
  await cp(path.join(distDir, entry.file), path.join(distDir, jsAlias), { force: true });

  const cssFiles = Array.isArray(entry.css) ? entry.css : [];
  for (const [index, cssFile] of cssFiles.entries()) {
    const alias = index === 0 ? "assets/app.css" : `assets/app-${index + 1}.css`;
    aliasMappings.push({ source: cssFile, target: alias });
    await cp(path.join(distDir, cssFile), path.join(distDir, alias), { force: true });
  }

  const htmlPath = path.join(distDir, "index.html");
  let html = await readFile(htmlPath, "utf8");

  for (const { source, target } of aliasMappings) {
    const pattern = new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    html = html.replace(pattern, target);
  }

  await writeFile(htmlPath, html);
  process.stdout.write(`Linked dist entry point to stable aliases (js -> ${jsAlias}).\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
