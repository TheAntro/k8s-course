CREATE TABLE "request_counter" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'pingpong_counter',
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "request_counter_name_unique" UNIQUE("name")
);
