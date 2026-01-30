import express from "express";
import crypto from "crypto";
import fs from "fs/promises";

const PINGPONG_URL = process.env.PINGPONG_URL;
if (!PINGPONG_URL) {
  console.error("Missing required environment variable: PINGPONG_URL");
  process.exit(1);
}

const randomString = crypto.randomBytes(8).toString("hex");

let currentStatus = "";

function updateInMemoryStatus() {
  currentStatus = `${new Date().toISOString()} ${randomString}`;
}

updateInMemoryStatus();
setInterval(() => {
  updateInMemoryStatus();
}, 5000);

async function readPingPongCount(): Promise<number> {
  // Call the PingPong service's /pings endpoint which returns JSON { pings: <number> }
  try {
    const url = `${PINGPONG_URL}/pings`;

    // Use global fetch (Node 18+). If your runtime does not provide fetch, install a polyfill
    // such as node-fetch and import it instead.
    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) {
      console.error(
        `PingPong /pings request failed: ${resp.status} ${resp.statusText}`
      );
      return 0;
    }

    const body = await resp.json();
    if (body && typeof body.pings === "number") return body.pings;
    if (body && typeof body.pings === "string") {
      const parsed = parseInt(body.pings, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  } catch (err) {
    console.error("Failed to fetch ping count from PingPong service:", err);
    return 0;
  }
}

async function checkPingPongReachable(): Promise<boolean> {
  try {
    const url = `${PINGPONG_URL}/pings`;
    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return resp.ok;
  } catch (err) {
    console.error("PingPong reachability check failed:", err);
    return false;
  }
}

async function readInformation(): Promise<string> {
  const infoPath = process.env.INFO_PATH;
  if (!infoPath) {
    console.error("INFO_PATH env variable missing, unable to read information");
    return "";
  }
  try {
    const info = await fs.readFile(infoPath, "utf-8");
    return info;
  } catch (err) {
    console.error("Failed to read information");
    return "";
  }
}

const app = express();

app.get('/ready', async (_req: express.Request, res: express.Response) => {
  const ok = await checkPingPongReachable();
  if (ok) return res.status(200).send('ok');
  return res.status(503).send('pingpong unreachable');
});

app.use(async (req: express.Request, res: express.Response) => {
  const count = await readPingPongCount();
  const info = await readInformation();
  const message = process.env.MESSAGE || "";
  const body = `
  file content: ${info.trim()}
  env variable: MESSAGE=${message}
  ${currentStatus || ""}
  Ping / Pongs: ${count}`;
  res.type("text/plain").send(body);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Hashgenerator listening on port ${PORT}`);
});
