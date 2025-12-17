import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765904132713 implements MigrationInterface {
    name = 'Init1765904132713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quizzes_difficulty_level_enum" AS ENUM('EASY', 'MEDIUM', 'HARD')`);
        await queryRunner.query(`CREATE TYPE "public"."quizzes_quiz_type_enum" AS ENUM('PRACTICE', 'EXAM', 'ASSESSMENT')`);
        await queryRunner.query(`CREATE TABLE "quizzes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "category_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "difficulty_level" "public"."quizzes_difficulty_level_enum" NOT NULL DEFAULT 'MEDIUM', "time_limit" integer, "max_attempts" integer NOT NULL DEFAULT '1', "passing_score" double precision NOT NULL DEFAULT '70', "is_public" boolean NOT NULL DEFAULT true, "is_active" boolean NOT NULL DEFAULT true, "quiz_type" "public"."quizzes_quiz_type_enum" NOT NULL DEFAULT 'PRACTICE', "instructions" text, "thumbnail_id" uuid, "tags" text array NOT NULL DEFAULT '{}', "settings" jsonb NOT NULL DEFAULT '{}', "average_rating" double precision NOT NULL DEFAULT '0', "total_ratings" integer NOT NULL DEFAULT '0', "published_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_369913516cd527552f3011c42fd" UNIQUE ("slug"), CONSTRAINT "PK_b24f0f7662cf6b3a0e7dba0a1b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1686a07b8ff41be36a6c190c1f" ON "quizzes" ("published_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_255f6a81bba829c87c0810b7e3" ON "quizzes" ("quiz_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_817451f83fb225784b01fffd48" ON "quizzes" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_415fa0f36f70c345fc59ec9474" ON "quizzes" ("creator_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fe614b824b1dc21d87979e1ce3" ON "quizzes" ("category_id") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "icon_url" character varying, "parent_id" uuid, "sort_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_083b4657d537e819d86961f4aa" ON "categories" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_88cea2dc9c31951d06437879b4" ON "categories" ("parent_id") `);
        await queryRunner.query(`ALTER TABLE "quizzes" ADD CONSTRAINT "FK_fe614b824b1dc21d87979e1ce36" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_fe614b824b1dc21d87979e1ce36"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_88cea2dc9c31951d06437879b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_083b4657d537e819d86961f4aa"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe614b824b1dc21d87979e1ce3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_415fa0f36f70c345fc59ec9474"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_817451f83fb225784b01fffd48"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_255f6a81bba829c87c0810b7e3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1686a07b8ff41be36a6c190c1f"`);
        await queryRunner.query(`DROP TABLE "quizzes"`);
        await queryRunner.query(`DROP TYPE "public"."quizzes_quiz_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."quizzes_difficulty_level_enum"`);
    }

}
