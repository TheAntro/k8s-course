import express from "express";
import crypto from "crypto";
import fs from "fs";
const COUNT_PATH = process.env.COUNT_PATH;
if (!COUNT_PATH) {
    console.error("Missing required environment variable: LOG_PATH");
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
function readPingPongCount() {
    if (!fs.existsSync(COUNT_PATH))
        return 0;
    const content = fs.readFileSync(COUNT_PATH, "utf8");
    const trimmed = content.trim();
    if (trimmed === "")
        return 0;
    const parsed = parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
}
const app = express();
app.use((req, res) => {
    const count = readPingPongCount();
    const body = `${currentStatus || ""}\nPing / Pongs: ${count}`;
    res.type("text/plain").send(body);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Hashgenerator listening on port ${PORT}`);
});
