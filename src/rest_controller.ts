//|-----------------------------------------------------------------------------
//|            This source code is provided under the Apache 2.0 license      --
//|  and is provided AS IS with no warranty or guarantee of fit for purpose.  --
//|                See the project's LICENSE.md for details.                  --
//|           Copyright Refinitiv 2017.       All rights reserved.            --
//|-----------------------------------------------------------------------------

//*********************************************************************************************************************
// rest_controller.ts
// 
// The RESTConnectionController is a generic interface supporting the ability to connect and receive 
// Refinitiv Data Platform (RDP) HTTP REST services.  
// 
// Interface:
//
//      RESTConnectionController()
//      RESTConnectionController.getToken(url, refresh_token?);
//      RESTConnectionController.getToken_clientid(url, refresh_token?);
//      RESTConnectionController.getServiceDiscovery(url, IDataAuthen);
//
//
// Author: Wasin Waeosri
// Version: 1.5
// Date:    March 2021
//*********************************************************************************************************************


import * as EventEmitter from "events";
import * as rp from "request-promise";

import { IREST_Token } from "./json_msg_interface";
import { IREST_TokenPostData } from "./json_msg_interface";
import { IDataAuthen } from "./json_msg_interface";
import { IREST_ServiceGetData } from "./json_msg_interface";
import { IREST_RefreshToken } from "./json_msg_interface";

export { RESTConnectionController };

class RESTConnectionController {
    private username: string;
    private password: string;
    private client_id: string;
    private emitter: EventEmitter;
    private scope: string;
    private client_secret: string;
    constructor(username: string, password: string, client_id: string, scope: string, client_secret: string, emitter: EventEmitter) {
        this.username = username;
        this.password = password;
        this.client_id = client_id;
        this.scope = scope;
        this.client_secret = client_secret;
        this.emitter = emitter;
    }

    // Get Authentication Token and Re-Refresh Token based on Client ID
    public getToken_clientid = (url: string, refresh_token?: string) => {

        // Authentication Post body
        const data: IREST_Token = {
            username: this.username,
            password: this.password,
            grant_type: 'password',
            takeExclusiveSignOnControl: true,
            scope: this.scope,
            client_id: this.client_id,
            client_secret: this.client_secret
        };

        // Refresh Token Post body
        const auth_refresh_obj: IREST_RefreshToken = {
            username: '',
            refresh_token: '',
            grant_type: 'refresh_token',
            takeExclusiveSignOnControl: true,
        };

        let result: string = '';

        // HTTP request options
        const authen_options: IREST_TokenPostData = {
            method: 'POST',
            uri: url,
            form: '',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic',
            },
            json: true,
            resolveWithFullResponse: true,
            auth: {
                username: data.client_id,
                password: data.client_secret,
            },
            simple: true,
        };

        if (!refresh_token) {
            authen_options.form = data;
            result = 'REST_getTokenSuccess';
        } else {
            auth_refresh_obj.refresh_token = refresh_token;
            authen_options.form = auth_refresh_obj;

            result = 'REST_getRefreshSuccess';
        }

        console.log(`Sending authentication request with password to ${url}`)

        this.sendHttpRequest(authen_options).then((response: any) => {
            // console.log(`HTTP Request: RDP-GW Authentication success ${JSON.stringify(response)}`);
            console.log('HTTP Request: RDP-GW Authentication success');
            //this.myEmitter.emit('success', response);
            this.emitter.emit(result, response); // Send response back to a main class
        }, (error: any) => {
            console.log(`HTTP Request: RDP-GW Authentication error ${error}`);
            this.emitter.emit('REST_getTokenFail', error); // Send error back to a main class
        });

    }

    // Get Authentication Token and Re-Refresh Token based on Machine ID and Password
    public getToken = (url: string, refresh_token?: string) => {

        // Authentication Post body
        const data: IREST_Token = {
            username: this.username,
            password: this.password,
            grant_type: 'password',
            takeExclusiveSignOnControl: true,
            scope: 'trapi',
            client_id: this.client_id,
            client_secret: this.client_secret
        };

        // Refresh Token Post body
        const auth_refresh_obj: IREST_RefreshToken = {
            username: this.username,
            refresh_token: '',
            grant_type: 'refresh_token',
            takeExclusiveSignOnControl: true,
        };

        let result: string = '';

        // HTTP request options
        const authen_options: IREST_TokenPostData = {
            method: 'POST',
            uri: url,
            form: '',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic',
            },
            json: true,
            resolveWithFullResponse: true,
            auth: {
                username: data.username,
                password: data.client_secret,
            },
            simple: true,
        };

        if (!refresh_token) { // First Login
            authen_options.form = data;
            result = 'REST_getTokenSuccess';
        } else { // Second Login, re-refresh Token
            auth_refresh_obj.refresh_token = refresh_token;
            authen_options.form = auth_refresh_obj;

            result = 'REST_getRefreshSuccess';
        }

        console.log(`Sending authentication request with password to ${url}`)

        this.sendHttpRequest(authen_options).then((response: any) => {
            //console.log(`HTTP Request: Token success ${JSON.stringify(response)}`);
            console.log('HTTP Request: RDP-GW Authentication success');
            // this.myEmitter.emit('success', response);
            // this.emitter.emit('REST_getTokenSuccess', response);

            this.emitter.emit(result, response); // Send response back to a main class
        }, (error_response: any) => {
            //console.error(`HTTP Request: RDP-GW Authentication error ${JSON.stringify(error_response)}`);
            this.emitter.emit('REST_getTokenFail', error_response); // Send error back to a main class
        });

    }

    // Get RDP streaming/pricing
    public getServiceDiscovery = (url: string, data: IDataAuthen) => {

        const Authorization: string = 'Bearer ' + data.access_token; // Set Authorization Header

        // HTTP request options
        const service_options: IREST_ServiceGetData = {
            method: 'GET',
            uri: url,
            qs: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': Authorization,
            },
            json: true,
            resolveWithFullResponse: true,
        };

        console.log(`Sending RDP-GW service discovery request to ${url}`)

        this.sendHttpRequest(service_options).then((response: any) => {
            //console.log(`HTTP Request: RDP-GW service discovery success ${JSON.stringify(response)}`);
            console.log('HTTP Request: RDP-GW service discovery success');
            this.emitter.emit('REST_getServiceDiscoverySuccess', response);
        }, (error: any) => {
            console.log(`HTTP Request: RDP-GW service discovery error ${error}`);
            this.emitter.emit('REST_getServiceDiscoveryFail', error);
        });
    }

    // Send HTTP message using Node.js's request-promise library
    private sendHttpRequest(post_message: any) {
        // console.log('sendHttpRequest()');
        return rp(post_message)
            .then((response) => { // Get HTTP response 200
                // console.log(`response.statusCode = ${response.statusCode}`);
                return response.body;
            }).catch((error) => { // Get HTTP Error response
                // console.log(`sendHttpRequest Fail ${JSON.stringify(error.error)}`);
                //throw error // Work
                throw error.response; // Work
            });
    }
}
