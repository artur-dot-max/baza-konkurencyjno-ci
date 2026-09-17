import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--turbopack", ...process.argv.slice(2)], {
  stdio: "inherit", env: { ...process.env, NEXT_DIST_DIR: ".next-dev" },
});
child.on("exit", code => { process.exitCode = code ?? 1; });
