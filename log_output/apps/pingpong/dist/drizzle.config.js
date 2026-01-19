import "dotenv/config"; // This loads variables from your local .env file
import { defineConfig } from "drizzle-kit";
export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.DB_HOST || "localhost",
        port: 5432,
        user: "postgres",
        // Access the secret key via process.env
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "pingpong_db",
        ssl: false,
    },
});
