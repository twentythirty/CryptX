export class Recipe {
    public id: number;
    public created_timestamp: number;
    public investment_run_id: number;
    public user_created_id: number;
    public approval_status: string;
    public approval_timestamp: number;
    public approval_comment: string;
    public approval_user_id: number;
    public user_created: string;
    public approval_user: string;

    constructor(data: Recipe) {
        Object.assign(this, data);
    }
}
