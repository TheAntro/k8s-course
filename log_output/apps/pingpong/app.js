import express from "express";

const app = express();

let reqCounter = 0;

app.use((req, res) => {
  if (req.method === "GET") {
    const message = `pong ${reqCounter}`;
    reqCounter++;
    res.send(message);
  } else {
    res.status(404).send("Not Found")
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Pingpong listening on port ${PORT}`)
})