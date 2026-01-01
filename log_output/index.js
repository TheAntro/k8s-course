import crypto from "crypto";
import express from "express";

const randomString = crypto.randomBytes(8).toString("hex");
let currentStatus = null;
function updateStatus() {
  currentStatus = `${new Date().toISOString()} ${randomString}`;
}
updateStatus();
setInterval(() => {
  updateStatus();
  console.log(currentStatus);
}, 5000);

const PORT = process.env.PORT || 3000;

const app = express();
app.get("/status", (req, res) => {
  res.send(currentStatus);
});

app.listen(PORT, () => {
  console.log(`Log output listening on port ${PORT}`);
});
