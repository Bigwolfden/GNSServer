import {server as WebSocketServer} from "websocket";
import { httpServer } from "./server/index";
import { connection as pool} from "./server/database";


//Configure the port number
const PORT = 3000;

//Listen with the server
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Configure a websocket server
const wsServer = new WebSocketServer({
    // Set the http server to the one configured in server/index.js
    httpServer,
    autoAcceptConnections: false
});

// Decide whether the origin of a request is allowed.
const originIsGood = (origin: string) => {
    return true;
};
const handleUTF8 = (message: WSMessage) => {
    const data = message.data;
    console.log(`Recieved message: ${data.name} and ${data.age} and ${data.birthday}`);
}
wsServer.on('request', (req) => {
    if (!originIsGood(req.origin)) {
        // Reject the reqest if it doesn't come from the proper origin
        req.reject(403);
        console.log(`Connection from origin ${req.origin} rejected.`);
        return;
    }
    // Accept the connection from the request origin
    const connection = req.accept('echo-protocol', req.origin);

    // Handle any messages
    connection.on('message', async message => {
        switch (message.type) {
            case 'utf8':
                if (message.utf8Data) {
                    const data: WSMessage = JSON.parse(message.utf8Data);
                    handleUTF8(data);
                }
                ;
                const clients = await pool.query('SELECT * FROM clients;');
                connection.sendUTF(JSON.stringify(clients.rows));
                break;
        }
    });

    // Handle the closing of a connection
    connection.on('close', (code, description) => {
        console.log(`The connection ${connection.remoteAddress} has been closed with the code: ${code} and description: ${description}`);
    });
});