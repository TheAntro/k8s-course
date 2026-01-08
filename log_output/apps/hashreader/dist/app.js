import express from "express";
const app = express();
app.get("/status", (req, res) => {
    res.send("status");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Hashreader listening on port ${PORT}`);
});
