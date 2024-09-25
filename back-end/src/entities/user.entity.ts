import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ unique: true })
  userName!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ type: 'text', nullable: true })
  publicKey?: string;

  @Property({ type: 'timestamptz', default: 'now()' })
  createdAt!: Date;

  @Property({ type: 'timestamptz', default: 'now()' })
  updatedAt!: Date;
}
