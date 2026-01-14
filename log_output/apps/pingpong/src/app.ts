import express from "express";

const app = express();

let reqCounter = 0;

app.get("/pings", (req, res) => {
  res.json({ pings: reqCounter });
});

app.use(async (req: express.Request, res: express.Response) => {
  if (req.method === "GET") {
    reqCounter++;
    const message = `pong ${reqCounter}`;
    res.send(message);
  } else {
    res.status(404).send("Not Found");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Pingpong listening on port ${PORT}`);
});
