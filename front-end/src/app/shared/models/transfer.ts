export class Transfer {
     public id: number
     public asset: string
     public asset_id: number
     public gross_amount: number
     public net_amount: number
     public exchange_withdrawal_fee: number
     public status: number
     public cold_storage_account_id: string
     public custodian: string
     public strategy: string
     public source_exchange: string
     public source_amount: number
     public placed_timestamp: Date
     public completed_timestamp: Date
}