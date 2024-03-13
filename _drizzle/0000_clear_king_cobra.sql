-- Active: 1701207714444@@ep-weathered-heart-21165329.eu-central-1.aws.neon.tech@5432@Clarity_DB
DO $$ BEGIN
 CREATE TYPE "perkType" AS ENUM('Armor Trait Exotic', 'Armor Mod General', 'Armor Mod Combat', 'Armor Mod Activity', 'Armor Mod Seasonal', 'Weapon Perk', 'Weapon Perk Exotic', 'Weapon Trait', 'Weapon Trait Exotic', 'Weapon Trait Origin', 'Weapon Trait Origin Exotic', 'Weapon Trait Enhanced', 'Weapon Trait Enhanced Exotic', 'Weapon Frame', 'Weapon Frame Exotic', 'Weapon Frame Enhanced', 'Weapon Frame Enhanced Exotic', 'Weapon Catalyst Exotic', 'Weapon Mod', 'Subclass Fragment', 'Subclass Aspect', 'Subclass Super', 'Subclass Grenade', 'Subclass Melee', 'Subclass Class', 'Subclass Movement', 'Ghost Mod');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('user', 'admin', 'editor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" bigint NOT NULL,
	"username" varchar(30) NOT NULL,
	"text" text NOT NULL,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "de" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "en" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "es" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "es-mx" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fr" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "it" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ja" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ko" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "perk" (
	"hash" bigint PRIMARY KEY NOT NULL,
	"itemHash" bigint,
	"name_en" text NOT NULL,
	"name_de" text NOT NULL,
	"name_es" text NOT NULL,
	"name_es-mx" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_it" text NOT NULL,
	"name_ja" text NOT NULL,
	"name_ko" text NOT NULL,
	"name_pl" text NOT NULL,
	"name_pt-br" text NOT NULL,
	"name_ru" text NOT NULL,
	"name_zh-chs" text NOT NULL,
	"name_zh-cht" text NOT NULL,
	"itemName_en" text,
	"itemName_de" text,
	"itemName_es" text,
	"itemName_es-mx" text,
	"itemName_fr" text,
	"itemName_it" text,
	"itemName_ja" text,
	"itemName_ko" text,
	"itemName_pl" text,
	"itemName_pt-br" text,
	"itemName_ru" text,
	"itemName_zh-chs" text,
	"itemName_zh-cht" text,
	"type" "perkType" NOT NULL,
	"icon" text NOT NULL,
	"itemIcon" text,
	"appearsOn" jsonb NOT NULL,
	"linkedWith" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pl" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pt-br" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ru" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(30) NOT NULL,
	"password" varchar(256) NOT NULL,
	"salt" varchar(256) NOT NULL,
	"role" "role" NOT NULL,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zh-chs" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zh-cht" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" jsonb NOT NULL,
	"username" varchar(30) NOT NULL,
	"live" boolean DEFAULT false,
	"ready" boolean DEFAULT false,
	"timestamp" timestamp (0) DEFAULT now() NOT NULL,
	"hash" bigint NOT NULL,
	"enReferenceId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "de" ADD CONSTRAINT "de_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "de" ADD CONSTRAINT "de_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "de" ADD CONSTRAINT "de_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "en" ADD CONSTRAINT "en_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "en" ADD CONSTRAINT "en_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es" ADD CONSTRAINT "es_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es" ADD CONSTRAINT "es_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es" ADD CONSTRAINT "es_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es-mx" ADD CONSTRAINT "es-mx_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es-mx" ADD CONSTRAINT "es-mx_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "es-mx" ADD CONSTRAINT "es-mx_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fr" ADD CONSTRAINT "fr_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fr" ADD CONSTRAINT "fr_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fr" ADD CONSTRAINT "fr_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "it" ADD CONSTRAINT "it_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "it" ADD CONSTRAINT "it_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "it" ADD CONSTRAINT "it_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ja" ADD CONSTRAINT "ja_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ja" ADD CONSTRAINT "ja_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ja" ADD CONSTRAINT "ja_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ko" ADD CONSTRAINT "ko_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ko" ADD CONSTRAINT "ko_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ko" ADD CONSTRAINT "ko_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pl" ADD CONSTRAINT "pl_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pl" ADD CONSTRAINT "pl_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pl" ADD CONSTRAINT "pl_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pt-br" ADD CONSTRAINT "pt-br_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pt-br" ADD CONSTRAINT "pt-br_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pt-br" ADD CONSTRAINT "pt-br_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ru" ADD CONSTRAINT "ru_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ru" ADD CONSTRAINT "ru_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ru" ADD CONSTRAINT "ru_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-chs" ADD CONSTRAINT "zh-chs_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-chs" ADD CONSTRAINT "zh-chs_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-chs" ADD CONSTRAINT "zh-chs_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-cht" ADD CONSTRAINT "zh-cht_username_user_username_fk" FOREIGN KEY ("username") REFERENCES "user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-cht" ADD CONSTRAINT "zh-cht_hash_perk_hash_fk" FOREIGN KEY ("hash") REFERENCES "perk"("hash") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zh-cht" ADD CONSTRAINT "zh-cht_enReferenceId_en_id_fk" FOREIGN KEY ("enReferenceId") REFERENCES "en"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
