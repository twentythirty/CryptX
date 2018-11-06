export class User {
  public id: number;
  public first_name: string;
  public last_name: string;
  public email: string;
  public created_timestamp: string;
  public reset_password_token_hash: string;
  public reset_password_token_expiry_timestamp: string;
  public is_active: string | boolean;
  public roles?: number[];

  constructor (data: User) {
    Object.assign(this, data);
  }

  /* public getFullName () {
    return this.first_name + ' ' + this.last_name;
  } */
}
