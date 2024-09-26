import type { GetRepository } from '@mikro-orm/core/typings';
import { Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import type { EntityRepository } from '@mikro-orm/core/entity';
import type { EntityManager } from '@mikro-orm/core/EntityManager';
import jwt from 'jsonwebtoken';

import { CryptoService } from '../crypto.service';
import { User } from '../entities/user.entity';

export class UserController {

  private readonly entityManager: EntityManager;
  private readonly userRepository: GetRepository<User, EntityRepository<User>>;

  constructor(
    orm: MikroORM,
    private readonly cryptoService: CryptoService,
  ) {
    this.entityManager = orm.em.fork();
    this.userRepository = this.entityManager.getRepository<User>(User.name);
  }

  async loginUser(req: Request, res: Response) {
    const { userName, password, publicKey } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: 'Bad Request' });
    }

    const user: User | null = await this.userRepository.findOne({ userName });

    if (!user || !(await this.cryptoService.verifyPassword(password, user.password))) {
      return res.status(403).json({ message: 'Invalid credentials' });
    }

    if (publicKey) {
      user.publicKey = publicKey;
      await this.entityManager.persistAndFlush(user);
    }

    const profile = {
      id: user.id,
      userName: user.userName,
    };

    const token = jwt.sign(
      profile,
      process.env.JWT_SECRET || '',
      { expiresIn: `${process.env.JWT_EXPIRES_IN_H}h` },
    );

    res.json(token);
  }

}
