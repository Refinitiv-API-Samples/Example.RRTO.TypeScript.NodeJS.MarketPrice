//|-----------------------------------------------------------------------------
//|            This source code is provided under the Apache 2.0 license      --
//|  and is provided AS IS with no warranty or guarantee of fit for purpose.  --
//|                See the project's LICENSE.md for details.                  --
//|           Copyright Refinitiv 2017.       All rights reserved.            --
//|-----------------------------------------------------------------------------

//*********************************************************************************************************************
// market_price_streaming.ts
// 
// The main module based on Node.Js class utilizing Refinitiv Data Platform (RDP) and
// Refinitiv Real-Time - Optimized (Refinitiv Data Platform) to request and retrieve realtime market data.
//
// Author: Wasin Waeosri
// Version: 1.5
// Date:    March 2021
//*********************************************************************************************************************

import * as EventEmitter from "events";

import { IDataAuthen } from "./json_msg_interface";


import { RESTConnectionController } from "./rest_controller";
import { WSConnectionController } from "./websocket_controller";


let auth_hostname: string = 'api.refinitiv.com';

let auth_port: string = '443';
let auth_path: string = 'auth/oauth2/v1/token';
const discovery_path: string = 'streaming/pricing/v1/';

let username: string = '';
let password: string = '';
let client_id: string = '';
const client_secret: string = '';
const scope: string = 'trapi';

const auth_obj: IDataAuthen = {
    access_token: '',
    refresh_token: '',
    expires_in: '',
    transport: 'websocket',
    dataformat: 'tr_json2',
    position: '',
    appId: '256',
}

// initiate EventEmitter class for asynchronous sending and receiving "events" between each class  
class MyEmitter extends EventEmitter { }
const myEmitter: MyEmitter = new MyEmitter();
//const myEmitter2: MyEmitter = new MyEmitter();

//let hostName: string = '172.20.33.11';
const ip: any = require("ip");
auth_obj.position = ip.address();
let itemname: string = '/EUR=';
//let itemnames: string[] = ['EUR=','JPY='];
let REST_url: string = '';
let WS_URL: string = '';
const argv = require("optimist").argv; // For getting command line arguments 
let hostList: string[] = [];
let portList: string[] = [];
let hotstandby: boolean = false;

// WebSocket and REST controller classes
let ws_app: WSConnectionController;
let ws_app2: WSConnectionController;
let rest_app: RESTConnectionController;

// get command line arguments for setting application parameters
if (argv.app_id) {
    //appId = argv.app_id.toString();
    auth_obj.appId = argv.app_id.toString();
}
if (argv.user) {
    username = argv.user.toString();
}
if (argv.password) {
    password = argv.password.toString();
}
if (argv.clientid) {
    client_id = argv.clientid.toString();
}
if (argv.auth_hostname) {
    auth_hostname = argv.auth_hostname.toString();
}
if (argv.auth_port) {
    auth_port = argv.auth_port.toString();
}
if (argv.hotstandby) {
    hotstandby = true;
}
if (argv.ric) {
    itemname = argv.ric.toString();
}
if (argv.help) {
    console.log('Usage: $>node market_price_streaming.js [--app_id app_id] [--user user] [--password password] [--clientid clientid] [--position position] [--auth_hostname auth_hostname] [--auth_port auth_port] [--scope scope] [--ric ric] [--hotstandby] [--help]');
    process.exit();
}

// Initiate WebSocket controller class(es)
ws_app = new WSConnectionController(myEmitter, 'session1');
if (hotstandby) {
    ws_app2 = new WSConnectionController(myEmitter, 'session2');
}

// Initiate REST controller class
rest_app = new RESTConnectionController(username, password, client_id, scope, client_secret, myEmitter);

REST_url = `https://${auth_hostname}:${auth_port}/${auth_path}`;

// Get RDP Authentication token information 
rest_app.getToken_clientid(REST_url);

//Get Authentication Token (first request)
myEmitter.on('REST_getTokenSuccess', (event) => {
    // console.log(`Get Token ${JSON.stringify(event)}`); 
    auth_obj['access_token'] = event['access_token'];
    auth_obj['refresh_token'] = event['refresh_token'];
    auth_obj['expires_in'] = event['expires_in'];
    console.log(`RDP-GW Authentication succeeded. RECEIVED: ${JSON.stringify(event, null, 2)}`);

    // Register interval timer for <expires_in - 30 seconds> to re-send a refresh message to get new access_token
    if (auth_obj['expires_in']) {
        //rest_app.setRefreshTimer(parseInt(auth_obj['expires_in']));

        const millis: number = (parseInt(auth_obj['expires_in']) - 30) * 1000; //
        setInterval(() => {
            REST_url = `https://${auth_hostname}:${auth_port}/${auth_path}`;
            console.log(`Time to re-request refresh token to ${REST_url}`);
            rest_app.getToken_clientid(REST_url, auth_obj['refresh_token']);
        }, millis);
    }

    REST_url = `https://${auth_hostname}/${discovery_path}`;
    rest_app.getServiceDiscovery(REST_url, auth_obj);
});

// Get RDP Refresh Authentication Token
myEmitter.on('REST_getRefreshSuccess', (event) => {
    console.log(`Get Refresh Token `);
    auth_obj['access_token'] = event['access_token'];
    auth_obj['refresh_token'] = event['refresh_token'];
    auth_obj['expires_in'] = event['expires_in'];
    console.log(`RDP-GW Refresh Token: Authentication succeeded. RECEIVED: ${JSON.stringify(event, null, 2)}`);

    ws_app.refresh(auth_obj);
    if (hotstandby) {
        ws_app2.refresh(auth_obj);
    }
});

// Fail to get RDP Authentication Token
myEmitter.on('REST_getTokenFail', (err_response) => {
    //console.error(`Get Token Error ${err_event}`);
    console.log(JSON.stringify(err_response));
    switch (err_response['statusCode']) {
        case 301: //Moved
        case 302: //Redirect
        case 307: //TemporaryRedirect
        case 308: //Permanent Redirect
            // process Perform URL redirect
            console.error(`RDP-GW authentication HTTP code: ${err_response['statusCode']} ${err_response['body']['error_description']}`);
            let new_host: string = err_response['headers']['Location'];
            if (new_host) {
                console.log(`Perform URL redirect to ${new_host}`);
                rest_app.getToken_clientid(new_host);
            }
            break;
        case 400: // BadRequest
        case 401: // Unauthorized
            console.error(`RDP-GW authentication HTTP code: ${err_response['statusCode']} ${err_response['body']['error_description']}`);
            if (auth_obj['refresh_token']) {
                // Refresh token may have expired. Try using our password.
                console.log('Retry with username and password');
                rest_app.getToken_clientid(REST_url);
            }
            break;
        case 403: //Forbidden
        case 451: //Unavailable For Legal Reasons
            // Stop retrying with the request
            console.error(`RDP-GW authentication HTTP code: ${err_response['statusCode']} ${err_response['body']['error_description']}`);
            console.error('Stop retrying with the request');
            break;
        default:
            // Retry the request to the API gateway
            console.error(`RDP-GW authentication HTTP code: ${err_response['statusCode']} ${err_response['body']['error_description']}`);
            console.log('Retry the request to the API gateway');
            rest_app.getToken(REST_url, auth_obj['refresh_token']);
            break;
    }
});

// Get Pricing Service Discovery information, then initiates WebSocket connection
myEmitter.on('REST_getServiceDiscoverySuccess', (event) => {
    // console.log(`Get Service Discovery ${JSON.stringify(event)}`); 
    console.log(`RDP-GW Service discovery succeeded. RECEIVED: ${JSON.stringify(event, null, 2)}`);
    for (let node of event['services']) {
        if (!hotstandby) {
            if (node['location'].length === 2) {
                hostList.push(node['endpoint']);
                portList.push(node['port']);
                break;
            }
        } else {
            if (node['location'].length === 1) {
                hostList.push(node['endpoint']);
                portList.push(node['port']);
            }
        }
    }

    // Create Refinitiv Data Platform WebSocket server 1 URL
    WS_URL = `wss://${hostList[0]}:${portList[0]}/WebSocket`;
    console.log('Receive WebSocket Service Endpoint and Port, init WebSocket connection for session 1');
    // Initiate Refinitiv Data Platform WebSocket connection for session 1
    ws_app.connect(WS_URL, auth_obj);

    if (hotstandby) { // Hot Standby case
        // Create Refinitiv Data Platform WebSocket server 2 URL
        WS_URL = `wss://${hostList[1]}:${portList[1]}/WebSocket`;
        console.log('Receive WebSocket Service Endpoint and Port, init WebSocket connection for session 2');
        // Initiate Refinitiv Data Platform WebSocket connection for session 1
        ws_app2.connect(WS_URL, auth_obj);
    }

});

// Fail to get Pricing Service Discovery information
myEmitter.on('REST_getServiceDiscoveryFail', (err_event) => {
    console.error(`RDP-GW service discovery exception failure: ${err_event}`);
});

// Sucess initiate  WebSocket connection to Refinitiv Data Platform server
myEmitter.on('WS_onOpened', (event, session) => {
    console.log(`get event ${event} from ${session}`); //get event WebSocket Open:session2
});

// Receive incoming messages from Refinitiv Data Platform WebSocket server
myEmitter.on('WS_onMessage', (event, session) => {

    const msg = event;
    const msgType: string = msg.Type;
    switch (msgType) {
        case 'Refresh': {
            if (msg.Domain) {
                if (msg.Domain === 'Login') {
                    console.log(`Receive Login Refresh Message on ${session}: ${JSON.stringify(msg, null, 2)}`);

                    // Receive a Login Refresh message from WebSocket, subscribes item to Refinitiv Data Platform
                    console.log(`Sending Market Price request on ${session} for ${itemname} item`);
                    ws_app.sendMarketPriceRequest(itemname);

                    // Hot Standby case, subscribes item for session 2
                    if (hotstandby && session === 'session2') {
                        ws_app2.sendMarketPriceRequest(itemname);
                    }

                    // Batch subscription
                    //console.log(`Sending Batch Market Price request for  ${JSON.stringify(itemnames)} items`);
                    //ws_app.sendMarketPriceBatchRequest(itemnames);

                } else { // Receive Refresh message from WebSocket for others Domains
                    console.log(`Receive ${msg.Domain} Refresh Message on ${session}: ${JSON.stringify(msg, null, 2)}`);
                }
            } else { // Receive a Market Price domain item Refresh message from WebSocket
                console.log(`Receive Market Price Refresh Message on ${session}: ${JSON.stringify(msg, null, 2)}`);
            }
            break;
        }
        case 'Update': { // Receive an item Update message from WebSocket
            console.log(`Receive Update Message on ${session}: ${JSON.stringify(msg, null, 2)}`);
            break;
        }
        case 'Status': { // Receive a Status response message from WebSocket
            console.log(`Receive Status Message on ${session}: ${JSON.stringify(msg, null, 2)}`);
            break;
        }
        default:{
            console.log(`Receive Message on ${session}: ${JSON.stringify(msg, null, 2)}`);
        }
    }
});


// Handle user press Ctrl+C while running the application.
process.on('SIGINT', function() {
    console.log('Gracefully shutting down from Ctrl+C');
  
    if (ws_app){
        ws_app.disconnect(); //graceful close WebSocket connection
    }
    // Waiting time for clean WebSocket connection
    setTimeout(()=>{
        //graceful shutdown
        process.exit();
    }, 1000);
    
});

