export interface RolesPermissionsResultData {
    total: number;
    success?: boolean;
    data: Array<{
        id: number
        name: string
        permissions: Array<{
            id: number
            code: string
            name: string
        }>
    }>;
}
