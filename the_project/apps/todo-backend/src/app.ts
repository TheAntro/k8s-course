import express from "express";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db/index.js";
import { todos } from "./db/schema.js";
import { z } from "zod";

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

await runMigrations();

app.listen(PORT, () => {
  console.log("Todo Backend listening on port " + PORT);
});
