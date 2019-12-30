export interface WSMessage {
    status: 'ok' | 'error',
    event: EventType,
    data: any,
}
export enum EventType {
    CLIENTS
}