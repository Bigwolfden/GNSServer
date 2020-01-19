import { IncomingMessage } from "http";
import fetch from "node-fetch";
import { User } from "../Messages.types";
import {config} from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { pool } from "./database";
config();
const client = new OAuth2Client(process.env.CLIENT_ID);
export async function authenticateWS(request: IncomingMessage, cb: (err: string, user: User) => void) {
    //Create an empty user to use if the request gets rejected
    const emptyUser: User = {id: 0, name: '', title: ''};
    
    //Make sure that they have sent a token
    if (typeof request.headers.token == 'string') {
        try {
            //Check that the token is valid
            const ticket = await client.verifyIdToken({
                idToken: request.headers.token,
                audience: process.env.CLIENT_ID as string,            
            });
            //Use the token to get the user
            const payload = ticket.getPayload();
            if (!payload)
                throw new Error();

            //Make sure that the user is in the databse
            const users = await pool.query(`SELECT * FROM users WHERE gid = '${payload.sub}'`);

            //If the query found a result, great! They're an authorized user
            if (users.rows.length > 0) {
                const user = users.rows[0];
                cb('', user);
            } else {
                //If not, no good! Reject them
                cb('', emptyUser);
            }
        } catch (e) {
            console.log("Unable to validate the token from " + request.headers.host);
            cb('Invalid token', emptyUser);
        }
    } else {
        console.log('no good!');
        cb('Invalid token', emptyUser);
    }
}