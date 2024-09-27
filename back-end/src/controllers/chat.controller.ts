import { MikroORM } from '@mikro-orm/core';
import type { EntityRepository } from '@mikro-orm/core/entity';
import type { EntityManager } from '@mikro-orm/core/EntityManager';
import type { GetRepository } from '@mikro-orm/core/typings';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import WebSocket from 'ws';

import { User } from '../entities/user.entity';

export class ChatController {

  private readonly entityManager: EntityManager;
  private readonly userRepository: GetRepository<User, EntityRepository<User>>;
  private readonly chats = new Map<string, WebSocket>();

  constructor(
    orm: MikroORM,
  ) {
    this.entityManager = orm.em.fork();
    this.userRepository = this.entityManager.getRepository<User>(User.name);
  }

  async startChat(req: Request, res: Response) {
    const { userName, token } = req.body;

    let decodedToken: JwtPayload | string;

    try {
      decodedToken = jwt.verify(token as string, process.env.JWT_SECRET as string);
    } catch (err) {
      return res.status(403).json({ message: `Not authorized` });
    }

    if ((decodedToken as any).userName === userName) {
      return res.status(400).json({ message: `Can't start dialog with yourself` });
    }

    const user: User | null = await this.userRepository.findOne({ userName });

    if (!user) {
      return res.status(404).json({ message: `User ${userName} not found` });
    }

    if (!user.publicKey) {
      return res.status(404).json({ message: `User ${userName} not active` });
    }

    return res.json(user.publicKey);
  }

  onConnect(ws: WebSocket) {
    console.log('New client connected');

    ws.on('message', (message: string) => this.onMessage(ws, message));

    ws.on('close', () => this.onClose(ws));
  }

  private onMessage(ws: WebSocket, message: string): void {
    const parsedMessage = JSON.parse(message);
    let decodedToken: JwtPayload | string;

    try {
      decodedToken = jwt.verify(parsedMessage.token as string, process.env.JWT_SECRET as string);
    } catch (err) {
      console.log(err);
      ws.send(JSON.stringify('Access denied'));
      ws.close();
      return;
    }

    const senderName: string = (decodedToken as any)?.userName as string;

    switch (parsedMessage.type) {
      case 'connect':
        this.chats.set(senderName, ws);
        console.log(`${senderName} is online`);
        break;
      case 'message': {
        const recipientWs = this.chats.get(parsedMessage.recipient);

        if (!recipientWs) {
          return;
        }

        recipientWs.send(JSON.stringify({
          content: parsedMessage.content,
          iv: parsedMessage.iv,
          sender: senderName,
          recipient: parsedMessage.recipient,
          type: parsedMessage.type,
          aes: parsedMessage.aes,
        }));
        break;
      }
    }
  }

  private onClose(ws: WebSocket): void {
    console.log(`Client disconnected`);
  }
}
