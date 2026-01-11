import express from "express";
import fs from "fs/promises";

const COUNT_PATH = process.env.COUNT_PATH;
if (!COUNT_PATH) {
  console.error("Missing required environment variable: COUNT_PATH");
  process.exit(1);
}

const app = express();

let reqCounter = 0;

// Initialize the counter file to 0 at startup. This will create or overwrite the file.
(async () => {
  try {
    await fs.writeFile(COUNT_PATH, "0", { encoding: "utf8" });
    reqCounter = 0;
    console.log(`Initialized counter file at ${COUNT_PATH} to 0`);
  } catch (err) {
    console.error(`Failed to initialize counter file at ${COUNT_PATH}:`, err);
    process.exit(1);
  }
})();

app.use(async (req: express.Request, res: express.Response) => {
  if (req.method === "GET") {
    const message = `pong ${reqCounter}`;
    // increase counter and persist the new value to COUNT_PATH (overwrite)
    reqCounter++;
    try {
      await fs.writeFile(COUNT_PATH, String(reqCounter), { encoding: "utf8" });
    } catch (err) {
      // Log error but continue to respond so the service stays available.
      console.error(`Failed to write counter to ${COUNT_PATH}:`, err);
    }
    res.send(message);
  } else {
    res.status(404).send("Not Found");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Pingpong listening on port ${PORT}`);
});
