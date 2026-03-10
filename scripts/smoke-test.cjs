#!/usr/bin/env node
"use strict";

const { spawnSync } = require("child_process");

const nodeMajor = Number(process.versions.node.split(".")[0]);

if (!Number.isFinite(nodeMajor) || nodeMajor < 20) {
  process.stderr.write(
    `[smoke-test] Node ${process.version} detectado. Use Node 20+ para rodar os testes.\n`,
  );
  process.exit(1);
}

const steps = [
  { name: "Lint", command: "npm", args: ["run", "lint"] },
  { name: "Typecheck", command: "npm", args: ["run", "typecheck"] },
  { name: "Build", command: "npm", args: ["run", "build"] },
];

for (const step of steps) {
  process.stdout.write(`\n[smoke-test] ${step.name}\n`);

  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    const exitCode = result.status === null ? 1 : result.status;
    process.stderr.write(
      `\n[smoke-test] Falhou em: ${step.name} (exit ${exitCode}).\n`,
    );
    process.exit(exitCode);
  }
}

process.stdout.write("\n[smoke-test] OK: lint + typecheck + build.\n");
