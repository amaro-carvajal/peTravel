import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = await mkdtemp(join(tmpdir(), "petravel-e2e-"));
const database = `petravel_e2e_${randomUUID()}`;
const children = [];
let stopping = false;

const cleanup = async () => {
  if (stopping) return;
  stopping = true;
  for (const child of children.toReversed()) {
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  }
  await rm(dataDir, { recursive: true, force: true });
};

process.on("SIGTERM", () => void cleanup());
process.on("SIGINT", () => void cleanup());

const comprobarPuerto = async (port) => {
  const socket = createServer().listen(port, "127.0.0.1");
  await once(socket, "listening");
  const disponible = socket.address().port;
  await new Promise((resolve, reject) => socket.close((error) => error ? reject(error) : resolve()));
  return disponible;
};

try {
  await comprobarPuerto(4317);
  const mongoPort = await comprobarPuerto(0);

  const mongo = spawn("mongod", ["--dbpath", dataDir, "--bind_ip", "127.0.0.1", "--port", String(mongoPort), "--nounixsocket"], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  children.push(mongo);

  await new Promise((resolve, reject) => {
    mongo.once("error", reject);
    mongo.once("exit", (code) => reject(new Error(`MongoDB terminó antes de iniciar (código ${code}).`)));
    mongo.stdout.setEncoding("utf8");
    let pending = "";
    mongo.stdout.on("data", (chunk) => {
      pending += chunk;
      if (pending.includes("Waiting for connections")) resolve();
      pending = pending.slice(-256);
    });
  });

  if (!stopping) {
    const backend = spawn(process.execPath, ["dist/index.js"], {
      cwd: fileURLToPath(new URL("../backend/", import.meta.url)),
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: "4317",
        CLIENT_URL: "http://127.0.0.1:4317",
        MONGODB_URI: `mongodb://127.0.0.1:${mongoPort}/${database}`,
        MONGODB_DBNAME: database,
        JWT_SECRET: randomUUID(),
      },
    });
    children.push(backend);
    const [code] = await once(backend, "exit");
    if (!stopping) process.exitCode = code ?? 1;
  }
} catch (error) {
  if (!stopping) {
    console.error(error);
    process.exitCode = 1;
  }
} finally {
  await cleanup();
}
