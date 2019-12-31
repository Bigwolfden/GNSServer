export interface WSMessage {
    status: 'ok' | 'error',
    event: EventType,
    data: any,
}
export enum EventType {
    CLIENTS
}
export interface Client {
    id: number,
    first_name: string,
    last_name: string,
    phone: string,
    email: string,
    street_address: string,
    city: string,
    state: string
}