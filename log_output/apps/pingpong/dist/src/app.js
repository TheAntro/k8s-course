import express from "express";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./db/schema.js";
import { eq, sql } from "drizzle-orm";
const app = express();
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: "postgres",
    port: 5432,
});
const db = drizzle(pool, { schema });
async function setupDatabase() {
    console.log("⏳ Running database migrations...");
    // This looks at the SQL files inside your container's ./drizzle folder
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations complete.");
}
setupDatabase()
    .then(() => {
    const app = express();
    app.get("/pings", async (req, res) => {
        const { requestCounter } = schema;
        const result = await db
            .select()
            .from(requestCounter)
            .where(eq(requestCounter.name, "main_counter"))
            .limit(1);
        console.log("Requested for pings", "result", result);
        res.json({ pings: result });
    });
    app.use(async (req, res) => {
        const { requestCounter } = schema;
        console.log("pingpong route requested, incrementing");
        if (req.method === "GET") {
            try {
                const result = await db
                    .insert(requestCounter)
                    .values({ name: "pintpong_counter", count: 1 })
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
    app.listen(PORT, () => {
        console.log(`Pingpong listening on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
