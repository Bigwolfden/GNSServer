import WebSocket from "ws";
import { httpServer } from "./server/index";
import { pool } from "./server/database";
import { WSMessage, EventType, User } from "./Messages.types";
import { authenticateWS } from "./server/authenticate";
import { IncomingMessage } from "http";

//Configure the port number
const PORT = 3000;

//Listen with the server
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Configure a websocket server
const wsServer = new WebSocket.Server({
    // Set the http server to the one configured in server/index.js
    noServer: true
});
wsServer.on('connection', (socket: WebSocket, request: IncomingMessage, user: User) => {

    //Send them the clients
    sendClients(socket, user);

    socket.on('message', async (rawMessage) => {
        //Parse the message from json
        const message: WSMessage = JSON.parse(rawMessage as string);
        //Make sure it's the proper format and there's no errors
        if (!message.status || message.status == 'error') {
            console.log('Message error!');
            return;
        }
        //Handle the message types
        switch (message.event) {
            default:
                console.log('Unknown message event');
                break;
        }
    });
    socket.on('close', (code, reason) => {
        console.log(`The connection closed with code: ${code} and reason: ${reason}`);
    })
});
//Handles a request trying to connect to the websocket
httpServer.on('upgrade', (req, socket, head) => {
    //Authenticate the request
    authenticateWS(req, (err, user) => {

        //If there's an error or the user is empty, don't let them establish a websocket connection
        if (err || !user.name) {
            socket.destroy();
            return;
        }

        //If we're good, upgrade the connection
        wsServer.handleUpgrade(req, socket, head, ws => {
            wsServer.emit('connection', ws, req, user);
        });
    }) 
});
async function sendClients(ws: WebSocket, user:User) {
    //Anounce that clients are being sent to a specificied user
    console.log(`Sending clients to ${user.name}...`);
    //Get the clients from the database
    const {rows: clients} = await pool.query('SELECT * FROM clients;');
    //Form a message to send with the clients as the data
    const response: WSMessage = {
        status: 'ok',
        event: EventType.CLIENT_BASIC,
        data: clients
    }
    //Send the data over the socket
    ws.send(JSON.stringify(response));
    //Announce that the clients have been sent
    console.log(`Clients sent to ${user.name}.`);
}