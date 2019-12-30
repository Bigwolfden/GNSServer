interface WSMessage {
    status: 'ok' | 'error',
    event: EventType,
    data: any,
}
enum EventType {
    CLIENTS
}