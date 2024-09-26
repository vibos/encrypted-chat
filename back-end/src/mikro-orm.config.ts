import { MikroORM } from '@mikro-orm/core';
import type { EntityClass } from '@mikro-orm/core/typings';
import { Migrator } from '@mikro-orm/migrations';

import { User } from './entities/user.entity';
import { DummyUsersMigration } from './migrations/dummy-users.migration';
import { UserMigration } from './migrations/user.migration';

const {
  POSTGRESQL_HOST: host,
  POSTGRESQL_PORT: port,
  POSTGRESQL_DATABASE: dbName,
  POSTGRESQL_USER: user,
  POSTGRESQL_PASSWORD: password,
  POSTGRESQL_SCHEMA: schema,
  POSTGRESQL_DEBUG: debug,
} = process.env;

export const mikroOrmConfig: Parameters<typeof MikroORM.init>[0] = {
  entities: [User as EntityClass<User>],
  extensions: [Migrator],
  host,
  port: port ? parseInt(port, 10) : undefined,
  dbName,
  user,
  password,
  schema,
  debug: debug === 'true',
  migrations: {
    migrationsList: [
      {
        name: 'user.migration.ts',
        class: UserMigration,
      },
      {
        name: 'dummy-users.migration.ts',
        class: DummyUsersMigration,
      },
    ],
  },
}
