import { Migration } from '@mikro-orm/migrations';

export class UserMigration extends Migration {

  async up(): Promise<void> {
    await this.execute(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_name" character varying(50) NOT NULL, "password" character varying NOT NULL, "public_key" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_TABLE_users_FIELD_id" PRIMARY KEY ("id"))`);
  }

}
