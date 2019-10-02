require('dotenv').config();
const WebSocketServer = require('websocket').server;
const httpServer = require('./server');

//Configure the port number
const PORT  = 3000;

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
const originIsGood = origin => {
    return true;
};
const handleUTF8 = data => {
    const json = JSON.parse(data);
    console.log(`Recieved message: ${json.name} and ${json.age} and ${json.birthday}`);
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
    connection.on('message', (message) => {
        switch (message.type) {
            case 'utf8':
                handleUTF8(message.utf8Data);
                connection.sendUTF('Hello Mr. Client!');
                break;
        }
    });

    // Handle the closing of a connection
    connection.on('close', (code, description) => {
        console.log(`The connection ${connection.remoteAddress} has been closed with the code: ${code} and description: ${description}`);
    });
});