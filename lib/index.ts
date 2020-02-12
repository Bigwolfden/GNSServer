import WebSocket from "ws";
import { httpServer } from "./server/index";
import { pool } from "./server/database";
import { WSMessage, EventType, User } from "./Messages.types";
import { authenticateWS } from "./server/authenticate";
import { IncomingMessage } from "http";

//Configure the port number
const PORT = 3000;

//Keep track of all the online users
let onlineUsers: User[] = [];

//Listen with the server that has already been created with routes for the initalization
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Configure a websocket server
const wsServer = new WebSocket.Server({
    // Set the http server to the one configured in server/index.js
    noServer: true
});
wsServer.on('connection', (socket: WebSocket, request: IncomingMessage, user: User) => {

    //Add them to the list of online users
    onlineUsers.push(user);
    //Send them the clients
    //sendInitialClients(socket, user);

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
            case EventType.CLIENT_STAGE1:
                console.log(`Sending Stage 1 Clients to ${user.name}`);
                //Get all the clients that are in stage one
                const stage1 = await getClients(1);
                //Format the data into a message
                const stage1Message: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENT_STAGE1,
                    data: stage1
                }
                socket.send(JSON.stringify(stage1Message));
                break;
            case EventType.CLIENT_STAGE2:
                console.log(`Sending Stage 2 Clients to ${user.name}`);
                //Get all the clients that are in stage two
                const stage2 = await getClients(2);
                //Format the data into a message
                const stage2Message: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENT_STAGE2,
                    data: stage2
                }
                socket.send(JSON.stringify(stage2Message));
                break;
            case EventType.CLIENT_ARCHIVE:
                console.log(`Sending Archived Clients to ${user.name}`);
                //Get all the clients that are archieved
                const archieved = await getClients(3);
                //Format the data into a message
                const archievedMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENT_ARCHIVE,
                    data: archieved
                }
                socket.send(JSON.stringify(archievedMessage));
                break;
            case EventType.UPDATE:
                console.log(`Updating changes made by ${user.name}`);
                //Get the client id and the name of the field being updated
                const {id: updateId, field, value} = message.data;
                //Update the information in the database
                await pool.query(`UPDATE clients SET ${field} = ${value} WHERE id = ${updateId}`);

                //Get the updated client
                const {rows: client} = await pool.query(`SELECT * FROM clients WHERE id = ${updateId}`);
                //Format the client into a message
                const clientMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.UPDATE,
                    data: client
                };
                //Broadcast the updated client
                broadcastMessage(clientMessage);
                break;
            case EventType.ADD_COMMENT:
                console.log(`Adding comment made by ${user.name}`);
                //Get the client id, and the user who made the comment's id
                const {clientId, userId, text} = message.data;
                //Get the time
                const date = new Date(Date.now()).toISOString();
                //Add to the database
                await pool.query(`INSERT INTO comments (client_id, author_id, message, date) VALUES (${clientId}, ${userId}, ${text}, ${date});`);
                
                //Now get the newly added comment
                const {rows: comment} = await pool.query(`SELECT * FROM comments WHERE date = ${date};`);
                //Transform the name of the fields into the standard that we use
                comment[0] = {
                    client_id: comment[0].client_id,
                    author_id: comment[0].author_id,
                    message: comment[0].message,
                    date: comment[0].date,
                };
                //Create a message for the comment
                const commentMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.ADD_COMMENT,
                    data: comment[0]
                }
                //Broadcast the comment
                broadcastMessage(commentMessage);
                break;
            case EventType.DELETE_COMMENT:
                console.log(`Deleting the comment that ${user.name} deleted`);
                //Get the comment id
                const {id} = message.data;
                //Get the comment's information
                const {rows: deletedComment} = await pool.query(`SELECT * FROM comments WHERE id = ${id}`);
                //Delete the comment from the comments table
                await pool.query(`DELETE FROM comments WHERE id = ${id};`);
                //Broadcast that the comment was deleted
                const deletionMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.DELETE_COMMENT,
                    data: {
                        client_id: deletedComment[0].client_id,
                        comment_id: id
                    }
                }
                broadcastMessage(deletionMessage);
                break;
            case EventType.ONLINE_USERS:
                console.log(`Sending online users to ${user.name}`);
                //Format the list of online users into a message
                const onlineMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.ONLINE_USERS,
                    data: onlineUsers
                }
                //Send the message
                socket.send(JSON.stringify(onlineMessage));
                break;
            case EventType.CLIENT_NEXTSTAGE:
                console.log(message);
                //Get the id of the client
                const {client_id, new_stage} = message.data;
                //Update the client in the database
                await pool.query(`UPDATE clients SET stage = ${new_stage} WHERE id = ${client_id}`);
                //Broadcast the same information
                const nextStageMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENT_NEXTSTAGE,
                    data: message.data
                }
                broadcastMessage(nextStageMessage);
                break;
            default:
                console.log('Unknown message event');
                break;
        }
    });
    socket.on('close', (code, reason) => {
        console.log(`${user.name}'s connection closed with code: ${code} and reason: ${reason}`);
        //Remove them from the list of online users
        onlineUsers = onlineUsers.filter(online => online.id != user.id);
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
/**
 * Gets all the clients in a specified stage
 * @param stage The stage that the client is in. 1 and 2 for Stages 1 and 2, and 3 for archive
 * @return An array of all the clients
 */
async function getClients(stage: number) {
    //Get all the clients
    const {rows: clients} = await pool.query(`SELECT * FROM clients WHERE stage = ${stage};`);
    //Loop through and get all the comments for each client
    clients.forEach(async client => {
        const {rows: comments} = await pool.query(`SELECT * FROM comments WHERE client_id = ${client.id}`);
        //Add the comments to the client object
        client.comments = comments;
    });
    //Return the completed client list
    return clients;
}
/**
 * Sends a message to every connected client
 * @param message The message to broadcast
 */
async function broadcastMessage(message: WSMessage) {
    wsServer.clients.forEach(websocket => {
        //Make sure the client is open
        if (websocket.readyState == WebSocket.OPEN)
            //Send the message to the application
            websocket.send(JSON.stringify(message));
    });
}