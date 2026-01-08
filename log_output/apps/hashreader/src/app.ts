import express from "express";
import fs from "fs";

const LOG_PATH = process.env.LOG_PATH;
if (!LOG_PATH) {
  console.error("Missing required environment variable: LOG_PATH");
  process.exit(1);
}

const app = express();

app.get("/", (req, res) => {
  if (fs.existsSync(LOG_PATH)) {
    const content = fs.readFileSync(LOG_PATH, "utf8");
    res.type("text/plain").send(content);
  } else {
    res.status(500).send("Something went wrong");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Hashreader listening on port ${PORT}`);
});
