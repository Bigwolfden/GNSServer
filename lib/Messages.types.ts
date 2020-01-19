export interface WSMessage {
    status: 'ok' | 'error',
    event: EventType,
    data: any,
}
export enum EventType {
    CLIENT_BASIC,
    CLIENT_TEMPLATES,
    CLIENT_INVOICE,
    CLIENT_INSTALLATION,
    UPDATE,
    GET_COMMENTS,
    ADD_COMMENT,
    TOGGLE_COMMENT
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
export interface User {
    id: number,
    name: string,
    title: string,
}