import { Router } from 'express';
import { MikroORM } from '@mikro-orm/core';
import WebSocket, { WebSocketServer } from 'ws';

import { ChatController } from './controllers/chat.controller';
import { UserController } from './controllers/user.controller';
import { CryptoService } from './crypto.service';

export function appRoutes(
  orm: MikroORM,
  cryptoService: CryptoService,
): Router {
  const router = Router();
  const userController = new UserController(orm, cryptoService);
  const chatController = new ChatController(orm);
  const wss = new WebSocketServer({ port: 8080 });

  router.post('/login', (req, res) => userController.loginUser(req, res));
  router.post('/chat', (req, res) => chatController.startChat(req, res));
  wss.on('connection', (ws: WebSocket) => chatController.onConnect(ws));

  return router;
}
