import { Router } from 'express';
import { MikroORM } from '@mikro-orm/core';

import { UserController } from './controllers/user.controller';
import { CryptoService } from './crypto.service';

export function appRoutes(
  orm: MikroORM,
  cryptoService: CryptoService,
): Router {
  const router = Router();
  const userController = new UserController(orm, cryptoService);

  router.post('/login', (req, res) => userController.loginUser(req, res));

  return router;
}
