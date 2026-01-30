import express from "express";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db/index.js";
import { todos } from "./db/schema.js";
import { z } from "zod";

async function runMigrations() {
  console.log("⏳ Running migrations...");
  let attempt = 0;
  const maxDelay = 30000;
  while (true) {
    attempt += 1;
    try {
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("✅ Migrations completed successfully.");
      break;
    } catch (error) {
      console.error(`❌ Migration attempt ${attempt} failed:`, error);
      const delay = Math.min(
        1000 * Math.pow(2, Math.min(attempt, 5)),
        maxDelay,
      );
      console.log(`Retrying migrations in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
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

const postTodoSchema = z.object({
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(140, "Content must be 140 characters or less"),
});

app.post("/todos", async (req, res) => {
  console.log("POST /todos");
  const parsed = postTodoSchema.safeParse(req.body);

  if (!parsed.success) {
    const errorSummary = parsed.error.issues
      .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
      .join(", ");
    console.error(`Todo validation Failed: ${errorSummary}`);
    const flattened = z.flattenError(parsed.error);
    return res
      .status(400)
      .json({ status: "error", errors: flattened.fieldErrors });
  }

  console.log("Received new todo:", parsed.data);
  const result = await db
    .insert(todos)
    .values({ content: parsed.data.content })
    .returning();
  res.status(201).json(result[0]);
});

async function isDbConnected(timeout = 2000) {
  try {
    await Promise.race([
      pool.query("SELECT 1"),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout),
      ),
    ]);
    return true;
  } catch (err) {
    console.error("DB connectivity check failed:", err);
    return false;
  }
}

app.get("/ready", async (_req, res) => {
  const ok = await isDbConnected(2000);
  if (ok) return res.status(200).json({ status: "ready" });
  return res.status(503).json({ status: "not ready" });
});

app.listen(PORT, () => {
  console.log("Todo Backend listening on port " + PORT);
});

// Run migrations in background and keep retrying until they succeed.
runMigrations();
