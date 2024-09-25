import { Migration } from '@mikro-orm/migrations';

import { CryptoService } from '../crypto.service';
import { User } from '../entities/user.entity';

export class DummyUsersMigration extends Migration {

  async up(): Promise<void> {
    const cryptoService = new CryptoService();

    const createUser = async (userName: string, password: string) => {
      const passwordHash = await cryptoService.hashPassword(password);

      return {
        userName,
        password: passwordHash,
      } as User
    };

    const em = this.getEntityManager();
    em.create(User.name, await createUser('Alfa', 'Zulu'));
    em.create(User.name, await createUser('Bravo', 'Zulu'));
    em.create(User.name, await createUser('Charlie', 'X-ray'));
    em.create(User.name, await createUser('Delta', 'Whiskey'));
    await em.flush();
  }

}
