export interface WSMessage {
    status: 'ok' | 'error',
    event: EventType,
    data: any,
}
export enum EventType {
    CLIENT_STAGE1,
    CLIENT_STAGE2,
    CLIENT_ARCHIVE,
    UPDATE,
    ADD_COMMENT,
    DELETE_COMMENT,
    USERS,
    ADD_CLIENT,
    CLIENT_NEXTSTAGE,
    ADD_USER
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
    email: string,
}