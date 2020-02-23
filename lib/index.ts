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

    //Add them to the list of online users (if it is a user)
    if (user.email != '')
        onlineUsers.push(user);

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
                console.log(`Sending Stage 1 Clients to ${user.email}`);
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
                console.log(`Sending Stage 2 Clients to ${user.email}`);
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
                console.log(`Sending Archived Clients to ${user.email}`);
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
                console.log(`Updating changes made by ${user.email}`);
                //Get the client id and the name of the field being updated
                const {client_id: updateId, changes} = message.data;
                for (let change of changes) {
                    await pool.query('UPDATE clients SET ' + change.key + ' = $1 WHERE id = $2;', [change.data, updateId]);
                }
                //Get the updated client
                const {rows: client} = await pool.query(`SELECT * FROM clients WHERE id = $1;`, [updateId]);
                //Format the client into a message
                const clientMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.UPDATE,
                    data: client[0]
                };
                //Broadcast the updated client
                broadcastMessage(clientMessage);
                break;
            case EventType.ADD_COMMENT:
                console.log(`Adding comment made by ${user.email}`);
                //Get the client id, and the user who made the comment's id
                const {client_id: clientId, message: text, author_name, author_picture} = message.data;
                //Get the time
                const date = new Date(Date.now()).toISOString();
                //Add to the database
                const addQuery = "INSERT INTO comments (client_id, message, date, author_name, author_picture) VALUES ($1, $2, $3, $4, $5);";
                const addValues = [clientId, text, date, author_name, author_picture];
                await pool.query(addQuery, addValues);
                //Now get the newly added comment
                const {rows: comment} = await pool.query('SELECT * FROM comments WHERE date = $1;', [date]);
                //Transform the name of the fields into the standard that we use
                const data = {
                    client_id: comment[0].client_id,
                    id: comment[0].id,
                    author_name: comment[0].author_name,
                    author_picture: comment[0].author_picture,
                    message: comment[0].message,
                    date: comment[0].date,
                };
                //Create a message for the comment
                const commentMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.ADD_COMMENT,
                    data
                }
                //Broadcast the comment
                broadcastMessage(commentMessage);
                break;
            case EventType.DELETE_COMMENT:
                console.log(`Deleting the comment that ${user.email} deleted`);
                //Get the comment id
                const {id} = message.data;
                //Get the comment's information
                const {rows: deletedComment} = await pool.query('SELECT * FROM comments WHERE id = $1;', [id]);
                //Make sure the comment still exists
                if (deletedComment[0]) {
                    //Delete the comment from the comments table
                    await pool.query(`DELETE FROM comments WHERE id = ${id};`);
                    //Broadcast that the comment was deleted
                    const deletionMessage: WSMessage = {
                        status: 'ok',
                        event: EventType.DELETE_COMMENT,
                        data: {
                            client_id: deletedComment[0].client_id,
                            id
                        }
                    }
                    broadcastMessage(deletionMessage);
                }
                break;
            case EventType.ADD_CLIENT:
                console.log(message.data);
                const {first_name, last_name, phone, email: client_email, street_address: address, city, zip, state} = message.data;
                const values = [first_name, last_name, phone.substring(0,10), client_email, address, city, zip, state];
                //Don't add to the database if any value is blank
                for (let value of values) {
                    if (!value || value == "") return;
                }
                //Add them to the database
                await pool.query("INSERT INTO clients (first_name, last_name, phone, email, street_address, city, zip, state, date_added, stage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, 1);", values);
                //Get the full client
                const {rows: addedClient} = await pool.query('SELECT * FROM clients WHERE first_name = $1 AND last_name = $2 AND phone = $3;',[first_name, last_name, phone.substring(0,10)]);
                //Send the client
                const addClientMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.ADD_CLIENT,
                    data: addedClient[0]
                };
                broadcastMessage(addClientMessage);
                break;
            case EventType.USERS:
                console.log(`Sending users to ${user.email}`);
                //Get all the users from the database
                const {rows: tempUsers} = await pool.query('SELECT * FROM users;');
                //See who's online or not
                let allUsers = []
                
                for (let aUser of tempUsers) {
                    let isOnline = false;
                    for (let onlineUser of onlineUsers) {
                        if (onlineUser.id == aUser.id)
                            isOnline = true
                    }
                    allUsers.push({...aUser, online: isOnline});
                }
                //Format the list of users into a message
                const onlineMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.USERS,
                    data: allUsers
                }
                //Send the message
                socket.send(JSON.stringify(onlineMessage));
                break;
            case EventType.CLIENT_NEXTSTAGE:
                console.log(message);
                //Get the id of the client
                const {client_id, new_stage} = message.data;
                //Update the client in the database
                await pool.query(`UPDATE clients SET stage = $1 WHERE id = $2;`, [new_stage, client_id]);
                //Broadcast the same information
                const nextStageMessage: WSMessage = {
                    status: 'ok',
                    event: EventType.CLIENT_NEXTSTAGE,
                    data: message.data
                }
                broadcastMessage(nextStageMessage);
                break;
            case EventType.ADD_USER:
                //Get the email address
                const {email} = message.data;
                await pool.query('INSERT INTO users (email) VALUES ($1)', [email]);
                console.log(`Added ${email} to approved accounts`);
                break;
            default:
                console.log('Unknown message event');
                break;
        }
    });
    socket.on('close', (code, reason) => {
        console.log(`${user.email}'s connection closed with code: ${code} and reason: ${reason}`);
        //Remove them from the list of online users
        onlineUsers = onlineUsers.filter(online => online.id != user.id);
    })
});
//Handles a request trying to connect to the websocket
httpServer.on('upgrade', (req, socket, head) => {
    //Authenticate the request
    authenticateWS(req, (err, user) => {

        //If there's an error or the user is empty, don't let them establish a websocket connection
        if (err || !user.email) {
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
 * @return {object} An array of all the clients
 */
async function getClients(stage: number) {
    //Get all the clients
    let {rows: clients} = await pool.query(`SELECT * FROM clients WHERE stage = ${stage};`);
    //Loop through and get all the comments for each client
    const newClients = await Promise.all(clients.map(async client => {
        const {rows: comments} = await pool.query(`SELECT * FROM comments WHERE client_id = ${client.id}`);
        //Add the comments to the client object
        return {...client, comments};
    }));
    //Return the completed client list
    return newClients;
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