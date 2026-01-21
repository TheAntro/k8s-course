import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  user: "postgres",
  port: 5432,
});

export const db = drizzle(pool, { schema });
