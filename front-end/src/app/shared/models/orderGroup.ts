export class OrderGroup {
  public id?: number;
  public created_timestamp: number;
  public status: string;
  public approval_user: string;
  public approval_comment: string;

  constructor(data: OrderGroup) {
    Object.assign(this, data);
  }
}
