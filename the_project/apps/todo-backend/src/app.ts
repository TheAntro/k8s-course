import express from "express";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db/index.js";
import { todos } from "./db/schema.js";

async function runMigrations() {
  console.log("⏳ Running migrations...");
  try {
    // This looks for the folder we copied in the Dockerfile
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1); // Stop the container if migrations fail
  }
}

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.get("/todos", async (req, res) => {
  console.log("GET /todos");
  const result = await db.select().from(todos);
  res.json({ data: { todos: result } });
});

app.post("/todos", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  const result = await db.insert(todos).values({ content }).returning();
  res.status(201).json(result[0]);
});

await runMigrations();

app.listen(PORT, () => {
  console.log("Todo Backend listening on port " + PORT);
});
