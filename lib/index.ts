import WebSocket from "ws";
import { httpServer } from "./server/index";
import { connection as pool} from "./server/database";
import { WSMessage, EventType } from "./Messages.types";


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

wsServer.on('connection', (socket, request) => {
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
            case EventType.CLIENTS:
                console.log('Sending clients...');
                const {rows: clients} = await pool.query('SELECT * FROM clients;');
                const response: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENTS,
                    data: clients
                }
                socket.send(JSON.stringify(response));
                console.log('Clients sent.');
                break;
            default:
                console.log('Unknown message event');
                break;
        }
    });
    socket.on('close', (code, reason) => {
        console.log(`The connection closed with code: ${code} and reason: ${reason}`);
    })
});
httpServer.on('upgrade', (req, socket, head) => {
    wsServer.handleUpgrade(req, socket, head, ws => {
        wsServer.emit('connection', ws, req);
    });
});