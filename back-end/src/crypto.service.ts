import { hash, compare } from 'bcrypt';

export class CryptoService {

  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.CRYPT_SALT_ROUNDS ?? '', 10) || 10;
    const pepperedPassword: string = this.getPepperedPassword(password);

    return hash(pepperedPassword, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const pepperedPassword: string = this.getPepperedPassword(password);
    return compare(pepperedPassword, hash);
  }

  private getPepperedPassword(password: string): string {
    return `${password}_${process.env.CRYPT_PEPPER}`;
  }

}
