import { client as WebSocketClient } from "websocket";
import { WSMessage, EventType, Client } from "../Messages.types";

// Create a new websocket client
const client = new WebSocketClient();

// Handle when the connection fails
client.on('connectFailed', error => {
    console.error('Error connecting with the server: ' + error.message);
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
client.on('connect', connection => {
    console.log('The WebSocket Client has connected');
    
    // Handle connection errors
    connection.on('error', error => {
        console.log('Connection error: ' + error.message);
    });

    connection.on('close', (code, description) => {
        console.log(`The connection has been closed with code: ${code} and description: ${description}`);
    });

    connection.on('message', message => {
        //Ensure that the message data is in the proper format
        if (message.type == 'utf8' && message.utf8Data) {
            //Parse the data into json
            const parsedMessage: WSMessage = JSON.parse(message.utf8Data);

            //Ensure the message is ok
            if (parsedMessage.status == 'error') throw new Error("Error with the message! " + parsedMessage.data);

            //Handle each type of message
            switch(parsedMessage.event) {
                case EventType.CLIENTS:
                    displayClients(parsedMessage.data as Client[]);
                    break;
                default:
                    console.log("Unrecognized message!");
                    break;
            }
        } else {
            //There's something wrong with the connection
            console.log("Error! Message data is incorrect format");
        }
    });

    const sendTest = () => {
        //Create some test data
        const testData: WSMessage = {
            event: EventType.CLIENTS,
            status: 'ok',
            data: {
                name: 'Ryan',
                age: 16,
                birthday: new Date('9/16/01')
            }
        };
    
        //Send the data
        connection.sendUTF(JSON.stringify(testData));
    }

    sendTest();
});

// Connect to the server
client.connect('ws://localhost:3000', 'echo-protocol');