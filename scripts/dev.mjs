import { spawn } from "node:child_process";

function start(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true
  });
}

const client = start("npm", ["run", "dev"], "client");
const server = start("npm", ["run", "dev"], "server");

function shutdown() {
  client.kill();
  server.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
