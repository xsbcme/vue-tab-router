export class User {
  token?: string;
  username?: string;
  password?: string;

  constructor(options?: Partial<User>) {
    Object.assign(this, options);
  }
}
