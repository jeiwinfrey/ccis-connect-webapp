CREATE TABLE "virtual_tour_arrows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scene_id" text NOT NULL,
	"arrow_id" text NOT NULL,
	"pitch" text NOT NULL,
	"yaw" text NOT NULL,
	"target_scene_id" text NOT NULL,
	"label" text NOT NULL,
	"arrow_direction" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtual_tour_scenes" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"panorama" text NOT NULL,
	"start_yaw" text NOT NULL,
	"start_pitch" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "virtual_tour_arrows" ADD CONSTRAINT "virtual_tour_arrows_scene_id_virtual_tour_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."virtual_tour_scenes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_tour_arrows" ADD CONSTRAINT "virtual_tour_arrows_target_scene_id_virtual_tour_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "public"."virtual_tour_scenes"("id") ON DELETE cascade ON UPDATE no action;