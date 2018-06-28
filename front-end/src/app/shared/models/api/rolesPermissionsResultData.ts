export interface RolesPermissionsResultData {
    total: number
    data: Array<{
        id: number
        name: string
        permissions: Array<{
            id: number
            code: string
            name: string
        }>
    }>
}