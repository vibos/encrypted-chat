import express from 'express';
import { MikroORM } from '@mikro-orm/postgresql';
import bodyParser from 'body-parser';
import 'dotenv/config'

import { CryptoService } from './crypto.service';
import { mikroOrmConfig } from './mikro-orm.config';
import { appRoutes } from './routes';

async function bootstrap(): Promise<void> {
  const app = express();
  const orm = await MikroORM.init(mikroOrmConfig);
  const cryptoService = new CryptoService();
  const port = 2024;

  // Run migrations
  console.log(`Starting migrations`);
  const migrator = orm.getMigrator();
  await migrator.up()
  console.log(`Done with migrations`);

  app.use(bodyParser.json());
  app.use('/api', appRoutes(orm, cryptoService));

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

void bootstrap().catch((err) => {
  console.error(err);
});
