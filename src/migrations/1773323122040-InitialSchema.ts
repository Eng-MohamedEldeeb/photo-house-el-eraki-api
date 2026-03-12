import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773323122040 implements MigrationInterface {
    name = 'InitialSchema1773323122040'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_stockstatus_enum" AS ENUM('in_stock', 'low_stock', 'out_of_stock')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameEn" character varying NOT NULL, "nameAr" character varying NOT NULL, "descriptionEn" character varying DEFAULT 'no description', "descriptionAr" character varying DEFAULT 'no description', "price" numeric(10,2) NOT NULL, "sku" character varying, "stockQuantity" integer NOT NULL DEFAULT '0', "soldQuantity" integer NOT NULL DEFAULT '0', "lowStockThreshold" integer NOT NULL DEFAULT '10', "viewCount" integer NOT NULL DEFAULT '0', "stockStatus" "public"."products_stockstatus_enum" NOT NULL DEFAULT 'in_stock', "imageUrl" character varying, "imagePublicId" character varying, "isFeatured" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "categoryId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imageUrl" character varying, "imagePublicId" character varying, "nameEn" character varying NOT NULL, "nameAr" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4ba6d0c734d53f8e1b2e24b6c56" UNIQUE ("username"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ff56834e735fa78a15d0cf21926"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_stockstatus_enum"`);
    }

}
