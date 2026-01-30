import express from "express";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./db/schema.js";
import { eq, sql } from "drizzle-orm";
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: "postgres",
    port: 5432,
});
const db = drizzle(pool, { schema });
async function runMigrations() {
    console.log("⏳ Running database migrations...");
    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("✅ Migrations complete.");
    }
    catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}
const app = express();
app.get("/pings", async (req, res) => {
    const { requestCounter } = schema;
    const result = await db
        .select()
        .from(requestCounter)
        .where(eq(requestCounter.name, "pingpong_counter"))
        .limit(1);
    console.log("Requested for pings", "result", result);
    // Handled the empty array case to prevent runtime crashes if row doesn't exist yet
    const count = result.length > 0 ? result[0].count : 0;
    res.json({ pings: count });
});
app.get("/", async (req, res) => {
    const { requestCounter } = schema;
    console.log("root route requested, incrementing");
    if (req.method === "GET") {
        try {
            const result = await db
                .insert(requestCounter)
                .values({ name: "pingpong_counter", count: 1 })
                .onConflictDoUpdate({
                target: requestCounter.name,
                set: { count: sql `${requestCounter.count} + 1` },
            })
                .returning();
            const { count } = result[0];
            const message = `pong ${count}`;
            res.send(message);
        }
        catch (err) {
            console.error("DB Error:", err);
            res.status(500).send("Error connecting to database");
        }
    }
    else {
        res.status(404).send("Not Found");
    }
});
const PORT = process.env.PORT || 5000;
async function isDbConnected(timeout = 2000) {
    try {
        await Promise.race([
            pool.query('SELECT 1'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
        ]);
        return true;
    }
    catch (err) {
        // log the raw error for debugging; avoid referencing fields that TypeScript can't guarantee
        console.error('DB connectivity check failed:', err);
        return false;
    }
}
// Readiness endpoint used by Kubernetes readinessProbe
app.get("/ready", async (_req, res) => {
    const ok = await isDbConnected(2000);
    if (ok) {
        return res.status(200).json({ status: "ready" });
    }
    return res.status(503).json({ status: "not ready" });
});
app.listen(PORT, () => {
    console.log(`Pingpong listening on port ${PORT}`);
});
// Run migrations in background so the server can respond to readiness checks while migrations run
runMigrations().catch((err) => {
    console.error("Migration failure:", err);
    process.exit(1);
});
