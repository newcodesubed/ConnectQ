ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "founded_at" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "services" text[];--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "technologies_used" text[];--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "cost_range" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "delivery_duration" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "specializations" text[];--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "employee_count" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "reviews" text[];--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "twitter_url" text;