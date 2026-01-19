import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
export const requestCounter = pgTable("request_counter", {
    id: serial("id").primaryKey(),
    name: text("name").default("pingpong_counter").unique(),
    count: integer("count").default(0).notNull(),
});
