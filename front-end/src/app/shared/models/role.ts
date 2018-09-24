export class Role {
    public id?: number;
    public name: string;
    public permissions: string[];

    constructor (data: Role) {
        Object.assign(this, data);
    }
}
