CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"file_url" varchar(500)
);
