import WebSocket from "ws";
import { WSMessage, EventType, Client } from "../Messages.types";

// Create a new websocket client
const client = new WebSocket('ws://localhost:3000', {
    headers: {
        token: '124'
    }
});

/*
    Helper functions
*/
function displayClients(clients: Client[]) {
    clients.forEach(value => {
        console.log(`Got client named ${value.first_name}`);
    });
}
// Handle when the client connects
client.on('open', () => {
    console.log('The WebSocket Client has connected');
    //Ask for the clients
    const clientReq: WSMessage = {
        status: 'ok',
        event: EventType.CLIENT_STAGE1,
        data: "",
    }
    client.send(JSON.stringify(clientReq));
});
client.on('error', (error) => {
    console.log('Connection error: ' + error.message);
});
client.on('close', (code, reason) => {
    console.log(`The connection has been closed with code: ${code} and description: ${reason}`);
});
client.on('message', (rawMessage: string) => {
    //Parse the message
    const message: WSMessage = JSON.parse(rawMessage);
    //Make sure it's the proper format and there's no errors
    if (!message.status || message.status == 'error') {
        console.log('Message error!');
        return;
    }
    switch(message.event) {
        case EventType.CLIENT_STAGE1:
            displayClients(message.data);
            break;
        default:
            console.log('Unknown message event');
            break;
    }
});