import crypto from "crypto";
import fs from "fs";

const LOG_PATH = process.env.LOG_PATH;
if (!LOG_PATH) {
  console.error("Missing required environment variable: LOG_PATH");
  process.exit(1);
}

const randomString = crypto.randomBytes(8).toString("hex");

function writeNewStatus() {
  const currentStatus = `${new Date().toISOString()} ${randomString}`;
  try {
    fs.appendFileSync(LOG_PATH, currentStatus + "\n", "utf8");
  } catch (err) {
    console.error("Failed to write status:", err);
  }
}

writeNewStatus();
setInterval(() => {
  writeNewStatus();
}, 5000);
