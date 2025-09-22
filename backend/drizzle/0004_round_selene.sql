CREATE TABLE "jobs" (CREATE TABLE "jobs" (CREATE TABLE "jobs" (

	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

	"client_id" uuid NOT NULL,	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

	"title" text NOT NULL,

	"description" text NOT NULL,	"client_id" uuid NOT NULL,	"client_id" uuid NOT NULL,

	"requirements" text,

	"budget" text,	"title" text NOT NULL,	"title" text NOT NULL,

	"timeline" text,

	"status" text DEFAULT 'open',	"description" text NOT NULL,	"description" text NOT NULL,

	"created_at" timestamp DEFAULT now(),

	"updated_at" timestamp DEFAULT now()	"requirements" text,	"requirements" text,

);

--> statement-breakpoint	"budget" text,	"budget" text,

CREATE TABLE "applications" (

	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,	"timeline" text,	"timeline" text,

	"job_id" uuid NOT NULL,

	"company_id" uuid NOT NULL,	"status" text DEFAULT 'open',	"status" text DEFAULT 'open',

	"message" text,

	"status" text DEFAULT 'pending',	"created_at" timestamp DEFAULT now(),	"created_at" timestamp DEFAULT now(),

	"created_at" timestamp DEFAULT now(),

	"updated_at" timestamp DEFAULT now()	"updated_at" timestamp DEFAULT now()	"updated_at" timestamp DEFAULT now()

);

--> statement-breakpoint););

ALTER TABLE "clients" ADD COLUMN "name" text;

--> statement-breakpoint--> statement-breakpoint--> statement-breakpoint

ALTER TABLE "clients" ADD COLUMN "email" text;

--> statement-breakpointCREATE TABLE "applications" (CREATE TABLE "applications" (

ALTER TABLE "clients" ADD COLUMN "image_url" text;

--> statement-breakpoint	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint	"job_id" uuid NOT NULL,	"job_id" uuid NOT NULL,

ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;

--> statement-breakpoint	"company_id" uuid NOT NULL,	"company_id" uuid NOT NULL,

ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
	"message" text,	"message" text,

	"status" text DEFAULT 'pending',	"status" text DEFAULT 'pending',

	"created_at" timestamp DEFAULT now(),	"created_at" timestamp DEFAULT now(),

	"updated_at" timestamp DEFAULT now()	"updated_at" timestamp DEFAULT now()

););

--> statement-breakpoint--> statement-breakpoint

ALTER TABLE "clients" ADD COLUMN "name" text;--> statement-breakpointALTER TABLE "clients" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint

ALTER TABLE "clients" ADD COLUMN "email" text;--> statement-breakpointALTER TABLE "clients" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint

ALTER TABLE "clients" ADD COLUMN "image_url" text;--> statement-breakpointALTER TABLE "clients" ADD COLUMN "image_url" text;--> statement-breakpoint

ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpointALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpointALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;