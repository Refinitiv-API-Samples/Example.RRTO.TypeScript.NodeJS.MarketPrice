//|-----------------------------------------------------------------------------
//|            This source code is provided under the Apache 2.0 license      --
//|  and is provided AS IS with no warranty or guarantee of fit for purpose.  --
//|                See the project's LICENSE.md for details.                  --
//|           Copyright Refinitiv 2017.       All rights reserved.            --
//|-----------------------------------------------------------------------------

//*********************************************************************************************************************
// websocket_controller.ts
// 
// The WSConnectionController is a generic interface supporting the ability to connect and receive real-time market 
// data quotes from the Refinitiv Real-Time - Optimized WebSocket interface. 
// 
// Interface:
// 
//      WSConnectionController()
//      WSConnectionController.connect(url, refresh_token?);
//      WSConnectionController.refresh(url, refresh_token?);
//      WSConnectionController.loginLocalADS(url, IDataAuthen);
//      WSConnectionController.sendMarketPriceRequest
//      WSConnectionController.sendMarketPriceRequest
// 
// 
// Author: Wasin Waeosri
// Version: 1.5
// Date:    March 2021
//*********************************************************************************************************************

import * as WebSocket from "ws";
import * as EventEmitter from "events";

import { IWS_Login } from "./json_msg_interface";
import { IWS_ItemRequestMsg } from "./json_msg_interface";
import { IWS_Pong } from "./json_msg_interface";
import { IWS_BatchItemRequestMsg } from "./json_msg_interface";
import { IDataAuthen } from "./json_msg_interface";

export { WSConnectionController };

class WSConnectionController {
    private emitter: EventEmitter;
    private readonly ws_protocol: string = 'tr_json2';
    private readonly loginDomain: string = "Login";
    private readonly loginID: number = 1;
    //private ws_session: any = null;
    //private ws_session: any = null;
    private ws_session!: WebSocket;
    private session_name: string;
    private url: string = '';
    private isWebSocketOpen: boolean = false;
    private isUserDisconnect: boolean = false;
    private auth_obj: IDataAuthen = {
        access_token: '',
        refresh_token: '',
        expires_in: '',
        transport: 'websocket',
        dataformat: 'tr_json2',
        position: '',
        appId: '256',
    };
    

    constructor(emitter: EventEmitter, session_name: string) {
        this.emitter = emitter;
        this.session_name = session_name;
    }

    // Initiate WebSocket connection to WebSocket server
    public connect(url: string, auth_obj: IDataAuthen) {
        console.log(`${this.session_name} ws_connect to ${url}`);
        this.ws_session = new WebSocket(url, this.ws_protocol);
        this.ws_session.onopen = this.onOpen;
        this.ws_session.onmessage = this.onMessage;
        this.ws_session.onerror = this.onError;
        this.ws_session.onclose = this.onClose;

        this.auth_obj = auth_obj;
        this.url = url;
    }

    // User disconnect handle
    public disconnect(){
        console.log(`Closing the WebSocket connection for : ${this.session_name}`);
        this.isUserDisconnect = true;
        if (this.isWebSocketOpen){
            this.ws_session.close();
        }
    }

    // Update Login after re-refresh token
    public refresh(auth_obj: IDataAuthen) {
        this.auth_obj = auth_obj;
        this._send_login_request(true);
    }

    // Send a Batch Market Price JSON OMM request message to WebSocket server
    public sendMarketPriceBatchRequest(itemnames: string[]) {
        const itemID: number = this.loginID + 1;

        const item_request_msg: IWS_BatchItemRequestMsg = {
            ID: itemID,
            Key: {
                Name: itemnames,
            }
        };

        this.ws_session.send(JSON.stringify(item_request_msg));
        console.log(`Sent on ${this.session_name}:`);
        console.log(JSON.stringify(item_request_msg, null, 2));
    }

    // Send a Market Price JSON OMM request message to WebSocket server
    public sendMarketPriceRequest(itemname: string) {
        const itemID: number = this.loginID + 1;

        const item_request_msg: IWS_ItemRequestMsg = {
            ID: itemID,
            Key: {
                Name: itemname,
            }
        };

        this.ws_session.send(JSON.stringify(item_request_msg));
        console.log(`Sent on ${this.session_name}:`);
        console.log(JSON.stringify(item_request_msg, null, 2));
    }

    // send JSON OMM Login request message to local ADS server
    private loginLocalADS(user: string, appId: string, position: string) {
        let login_msg: IWS_Login = {
            ID: this.loginID,
            Domain: this.loginDomain,
            Key: {
                Name: '',
                Elements: {
                    ApplicationId: '',
                    Position: '',
                }
            }
        };

        login_msg['Key']['Name'] = user;
        login_msg['Key']['Elements']['ApplicationId'] = appId;
        login_msg['Key']['Elements']['Position'] = position;

        this.ws_session.send(JSON.stringify(login_msg));
        console.log(`Sent on ${this.session_name}:`);
        console.log(JSON.stringify(login_msg, null, 2));
    }

    // send JSON OMM Login request message to Refinitiv Real-Time - Optimized WebSocket server
    private _send_login_request(refresh = false) {
        const login_msg: IWS_Login = {
            ID: this.loginID,
            Domain: this.loginDomain,
            Key: {
                NameType: 'AuthnToken',
                Elements: {
                    ApplicationId: '',
                    Position: '',
                }
            },
        };

        if (refresh) { // If re-fresh Login information
            login_msg['Refresh'] = false;
        }

        login_msg['Key']['Elements']['ApplicationId'] = this.auth_obj.appId;
        login_msg['Key']['Elements']['Position'] = this.auth_obj.position;
        login_msg['Key']['Elements']['AuthenticationToken'] = this.auth_obj.access_token;

        this.ws_session.send(JSON.stringify(login_msg));
        console.log(`Sent on ${this.session_name}:`);
        console.log(JSON.stringify(login_msg, null, 2));
    }

    // Create the client PONG message  and send it to WebSocket server
    private sendPong = () => {
        const pong: IWS_Pong = { Type: "Pong" };
        console.log(`Sent on ${this.session_name}: ${JSON.stringify(pong, null, 2)}`);
        this.ws_session.send(JSON.stringify(pong));
    }

    // Process incoming JSON OMM Message 
    private processMessage = (msg: any) => {
        const msgType: string = msg.Type;

        if (msgType === 'Ping') { // WebSocket Ping message
            console.log(`RECEIVED on ${this.session_name} ${JSON.stringify(msg, null, 2)}`);
            this.sendPong(); // Send WebSocket Pong message back
        } else {
            // Send incoming message(s) to a main class
            this.emitter.emit('WS_onMessage', msg, this.session_name);
        }

    }

    // Indicates that the connection is ready to send and receive messages
    private onOpen = (event: any) => {
        //console.log(`WebSocket successfully connected for ${this.session_name}, sending login request message`);
        let msg = `WebSocket successfully connected for ${this.session_name}, sending login request message`;
        this.emitter.emit('WS_onMessage', msg, this.session_name);
        //setTimeout(() => this._send_login_request(), 3000);
        this.isWebSocketOpen = true;
        this._send_login_request();
    }

    // An event listener to be called when a message is received from the server
    private onMessage = (event: any) => {

        const parsedMsg = JSON.parse(event.data.toString());
        //console.log(`incoming WS message is ${JSON.stringify(parsedMsg, null, 2)}`);
        //console.log('Call this.processMessage()');
        for (let msg of parsedMsg) {
            this.processMessage(msg);
        }
    }

    // An event listener to be called when an error occurs. This is a simple event named "error".
    private onError = (event: any) => {
        console.error(`Error on ${this.session_name}: ${JSON.stringify(event.error)}`);
    }

    // An event listener to be called when the WebSocket connection's readyState changes to CLOSED.
    private onClose = (event: any) => {
        console.log(`WebSocket Close with code: ${JSON.stringify(event.code)} reason: ${JSON.stringify(event.reason)}`);
        
        this.isWebSocketOpen = false;
        
        if (!this.isUserDisconnect){
            console.log(`Reconnect to the endpoint for : ${this.session_name} after 3 seconds... `);

            setTimeout(()=>{
                this.connect(this.url, this.auth_obj);
            }, 3000);
        }
      

    }

}
