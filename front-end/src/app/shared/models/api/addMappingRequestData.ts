export class AddMappingRequestData {
    public exchange_mapping: Array<{
        exchange_id: number,
        external_instrument_id: string,
    }>;
}
