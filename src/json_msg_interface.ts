//|-----------------------------------------------------------------------------
//|            This source code is provided under the Apache 2.0 license      --
//|  and is provided AS IS with no warranty or guarantee of fit for purpose.  --
//|                See the project's LICENSE.md for details.                  --
//|           Copyright Refinitiv 2017.       All rights reserved.            --
//|-----------------------------------------------------------------------------

//*********************************************************************************************************************
// json_msg_interface.ts
// 
// Interfaces for all Refinitiv Data Platform and Refinitiv Real-Time - Optimized messages.
//
// Author: Wasin Waeosri
// Version: 1.5
// Date:    March 2021
//*********************************************************************************************************************

// -------------------------------- RDP REST --------- ----------------//

export interface IREST_Token {
    username: string;
    password: string;
    grant_type: string;
    takeExclusiveSignOnControl: boolean;
    scope: string;
    client_id: string;
    client_secret: string;
}

export interface IREST_TokenPostData {
    method: string;
    uri: string;
    form: any;
    headers: any;
    json: boolean;
    resolveWithFullResponse: boolean;
    auth: any;
    simple: boolean;
}

export interface IREST_RefreshToken {
    username: string;
    refresh_token: string;
    grant_type: 'refresh_token';
    takeExclusiveSignOnControl: boolean;
}

export interface IDataAuthen {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    transport: string;
    dataformat: string;
    position: string;
    appId: string;
}

export interface IREST_ServiceGetData {
    method: string;
    uri: string;
    qs: IDataAuthen;
    headers: any;
    json: boolean;
    resolveWithFullResponse: boolean;
}

// --------------------------------  WebSocket ----------------//

// Interface for WebSocket Login domain JSON message
export interface IWS_Login {
    ID: number;
    Domain: string;
    Key: IWS_LoginKey;
    Refresh?: boolean;
}

// Interface for WebSocket Login domain's Key attribute JSON message
// Name and NameType attributes are optional
export interface IWS_LoginKey {
    Elements: IWS_LoginKeyElements;
    Name?: string;
    NameType?: string;
}

// Interface for WebSocket Login domain's Key's Elements attribute JSON message
// AuthenticationToken attributes is optional
export interface IWS_LoginKeyElements {
    ApplicationId: string;
    Position: string;
    AuthenticationToken?: string;
}

// Interface for WebSocket Market Price domain item request JSON message
export interface IWS_ItemRequestMsg {
    ID: number;
    Domain?: string;
    Key: IWS_ItemRequestKey;
}

// Interface for WebSocket  Market Price domain item request's key attribute JSON message
// service name is an optional 
export interface IWS_ItemRequestKey {
    Name: string;

    Service?: string;
}

// Interface for WebSocket Market Price domain Batch items request JSON message
export interface IWS_BatchItemRequestMsg {
    ID: number;
    Key: IWS_BatchItemRequestKey;
}

// Interface for WebSocket  Market Price domain Batch items request's key attribute JSON message
// service name is an optional 
export interface IWS_BatchItemRequestKey {
    Name: string[];
    Service?: string;
}

//Interface for WebSocket Pong message (HB message between consumer and ADS server) 
export interface IWS_Pong {
    readonly Type: string;
}
