import express from "express";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

const todos: { content: string }[] = [];

app.get("/todos", (req, res) => {
  console.log("GET /todos");
  res.json({ data: { todos } });
});

app.post("/todos", (req, res) => {
  console.log("POST /todos");
  const { content } = req.body;
  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "Invalid todo" });
  }
  todos.push({ content });
  res.status(201).json({ success: "Todo added" });
});

app.listen(PORT, () => {
  console.log("Todo Backend listening on port " + PORT);
});
