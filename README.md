# Refinitiv Real-Time - Optimized WebSocket example with Node.js and TypeScript

## Table of Content

* [Overview](#overview)
* [TypeScript Overview](#typescript)
* [Prerequisites](#prerequisites)
* [How to run the application](#run_application)
* [How to run the application in Docker](#run_app_docker)
* [References](#references)

## <a id="overview"></a>Overview

**Update**: April 2021

[Refinitiv Data Platform (RDP)](https://developers.refinitiv.com/en/api-catalog/refinitiv-data-platform/refinitiv-data-platform-apis) gives you seamless and holistic access to all of the Refinitiv content (whether real-time or non-real-time, analytics or alternative datasets), commingled with your content, enriching, integrating, and distributing the data through a single interface, delivered wherever you need it.

As part of the Refinitiv Data Platform, [Refinitiv Real-Time - Optimized](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api/quick-start#connecting-to-refinitiv-real-time-optimized) (formerly known as Refinitiv Real-Time - Optimized) gives you access to best in class Real Time market data delivered in the cloud.  Refinitiv Real-Time - Optimized is a new delivery mechanism for RDP, using the AWS (Amazon Web Services) cloud. Once a connection to RDP is established using Refinitiv Real-Time - Optimized, data can be retrieved using [Websocket API for Pricing Streaming and Real-Time Services](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api) aka WebSocket API.

This example shows how to implement the Refinitiv Real-Time - Optimized [Node.js](https://nodejs.org/en/) application with TypeScript language. The application source codes are implemented in TypeScript language to connect, consuming RDP streaming market data through Refinitiv Real-Time - Optimized. All source codes will be compiled to readable JavaScript file with [Webpack](https://webpack.js.org/) JavaScript module bundler. The example functionalities are based on Refinitiv Real-Time - Optimized [**Service discovery Python example**](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api/download). 

![connection diagram](images/connection_diagram.png "connection diagram")

## <a id="typescript"></a>TypeScript Overview

[TypeScript](https://www.typescriptlang.org) is an open-source programming language developed and maintained by [Microsoft](https://www.microsoft.com). The language lead architect is [Anders Hejlsberg](https://github.com/ahejlsberg), lead architect of C# and creator of Delphi and Turbo Pascal. TypeScript is a typed superset of JavaScript that compiles to readable, standards-based JavaScript. The syntax is designed for application-scale JavaScript by adding optional types, classes, modules, ECMAScript 2015 features, and future proposals to JavaScript. TypeScript supports tools for large-scale JavaScript applications for any browser, for any host, on any OS. TypeScript is a first-class programming language in Microsoft Visual Studio and [Angular](https://angularjs.org/) web application platform. It also supported by various application frameworks like [React](https://github.com/Microsoft/TypeScript-React-Starter#typescript-react-starter), [NodeJS and Express framework](https://github.com/Microsoft/TypeScript-Node-Starter#typescript-node-starter), [ASP.Net Core](https://www.typescriptlang.org/docs/handbook/asp-net-core.html), [Vue.js](https://github.com/Microsoft/TypeScript-Vue-Starter#typescript-vue-starter), and more. 


## <a id="prerequisites"></a>Prerequisite
This example requires the following dependencies software.
1. [Node.js](https://nodejs.org/en/) runtime - version 11.4.0 or higher.
2. [npm](https://www.npmjs.com/) package manager (included in Node.js)
3. [TypeScript](https://www.typescriptlang.org) compiler (will be installed via ```npm install``` command)
4. [Express.js](https://expressjs.com/) web framework (will be installed via ```npm install``` command)
5. [Webpack](https://webpack.js.org/) JavaScript module bundler (will be installed via ```npm install``` command)
6. Access to the Refinitiv Refinitiv Data Platform and Refinitiv Real-Time - Optimized. 
7. [Docker Desktop/Engine](https://docs.docker.com/get-docker/) version 20.10.x and [Docker-Compose](https://docs.docker.com/compose/install/) version 1.29.x

Please contact your Refinitiv's representative to help you to access the RDP account and services. 

You can connect to Refinitiv Real-Time - Optimized from your existing VM, Cloud VM, or your local machine.

## Refinitiv Real-Time - Optimized connection parameters

*Username, password, and client_id*: To request your access token you must pass in a user name, password, and client_id credentials (or specify it with ```--user```, ```--password``` and ```--clientid``` parameters on the application command line). When you subscribe to Refinitiv Real-Time - Optimized, you will receive a Welcome email that provides a link to activate your machine account and create a password. The email includes a Machine ID. This is your username. You must use these credentials to obtain a client_id from an [AppGenerator tool](https://apac1.apps.cp.thomsonreuters.com/apps/AppkeyGenerator). The output of the tool is an AppKey, which is your client_id. 

If you do not have that email please contact your Refinitiv representative, or if you are not a client please click [Contact Us page](https://my.refinitiv.com) if you would like to try Refinitiv Real-Time data.

Optionally, the application subscribes a delay */EUR=* RIC code from Refinitiv Real-Time - Optimized by default. You can pass your interested RIC code to the ```--ric``` parameter on the application command line. You can find the Refinitiv RIC Code of your interested instrument via [RIC Search page](https://developers.refinitiv.com/elektron/websocket-api/dev-tools?type=ric)


## <a id="run_application"></a>How to run the application

1. Unzip or download the example project folder into a directory of your choice 
2. Run ```$> npm install``` command in the command prompt to install all the dependencies required to run the sample in a subdirectory called *node_modules/*.
3. If the machine is behind a proxy server, you need to configure Node.js uses proxy instead of a direct HTTP connection via the following command in a command prompt: 
    ```
    set https_proxy=http://<proxy.server>:<port>
    ```
4. Run ```$> npx webpack``` command in the command prompt to build and compile all TypeScript files in *src* folder into JavaScript file in  *./dist/* folder
5. In a command prompt, go to *./dist/* folder and run market_price_streaming.js Node.js application with the following command
    ```
    $> node market_price_streaming.js --user <Your Refinitiv Real-Time - Optimized username> --password <Your Refinitiv Real-Time - Optimized password> --clientid <client_id> --ric <Interested RIC code>
    ```
6. Upon execution, you will be presented with authentication and Refinitiv Real-Time - Optimized Service discovery processes via RDP Gateway REST API, then followed by initializing WebSocket connection between the application and Refinitiv Real-Time - Optimized. 
    ```
    Sending authentication request with password to https://api.refinitiv.com:443/auth/oauth2/v1/token
    HTTP Request: RDP-GW Authentication success
    RDP-GW Authentication succeeded. RECEIVED: {
    "access_token": "<Access Token>",
    "refresh_token": "<Refresh Token>",
    "expires_in": "300",
    "scope": "trapi.streaming.pricing.read",
    "token_type": "Bearer"
    }
    Sending RDP-GW service discovery request to https://api.refinitiv.com/streaming/pricing/v1/
    HTTP Request: RDP-GW service discovery success
    RDP-GW Service discovery succeeded. RECEIVED: {
    "services": [
        {
        "port": 443,
        "location": [
            "ap-southeast-1a"
        ],
        "transport": "websocket",
        "provider": "aws",
        "endpoint": "apac-1-t3.streaming-pricing-api.refinitiv.com",
        "dataFormat": [
            "tr_json2"
        ]
        },
        {
        "port": 443,
        "location": [
            "ap-southeast-1a",
            "ap-southeast-1b"
        ],
        "transport": "websocket",
        "provider": "aws",
        "endpoint": "apac-3-t3.streaming-pricing-api.refinitiv.com",
        "dataFormat": [
            "tr_json2"
        ]
        },
        {
        "port": 443,
        "location": [
            "ap-southeast-1b"
        ],
        "transport": "websocket",
        "provider": "aws",
        "endpoint": "apac-2-t3.streaming-pricing-api.refinitiv.com",
        "dataFormat": [
            "tr_json2"
        ]
        },
        .. //AMER and EMEA location
    ]
    }
    Receive RDP-RT Service Endpoint and Port, init WebSocket connection for session 1
    session1 ws_connect to wss://apac-3-t3.streaming-pricing-api.refinitiv.com:443/WebSocket
    WebSocket successfully connected for session1, sending login request message
    Sent on session1:
    {
    "ID": 1,
    "Domain": "Login",
    "Key": {
        "NameType": "AuthnToken",
        "Elements": {
        "ApplicationId": "256",
        "Position": "10.42.68.162",
        "AuthenticationToken": "<Access Token>"
        }
    }
    }
    Receive Login Refresh Message on session1: {
    "ID": 1,
    "Type": "Refresh",
    "Domain": "Login",
    "Key": {
        "Name": "<Name>",
        "Elements": {
        "AllowSuspectData": 1,
        "ApplicationId": "256",
        "ApplicationName": "ADS",
        "AuthenticationErrorCode": 0,
        "AuthenticationErrorText": {
            "Type": "AsciiString",
            "Data": null
        },
        "AuthenticationTTReissue": 1541069071,
        "Position": "10.42.68.162",
        "ProvidePermissionExpressions": 1,
        "ProvidePermissionProfile": 0,
        "SingleOpen": 1,
        "SupportEnhancedSymbolList": 1,
        "SupportOMMPost": 1,
        "SupportPauseResume": 0,
        "SupportStandby": 0,
        "SupportBatchRequests": 7,
        "SupportViewRequests": 1,
        "SupportOptimizedPauseResume": 0
        }
    },
    "State": {
        "Stream": "Open",
        "Data": "Ok",
        "Text": "Login accepted by host ads-premium-az2-green-4-main-prd.use1-az2."
    },
    "Elements": {
        "PingTimeout": 30,
        "MaxMsgSize": 61430
    }
    }
    ```
7. Then the application will receive an initial image called a RefreshMsg. The RefreshMsg or initial image contains all fields for the requested instrument representing the latest up-to-date market values. Following this image, you will begin to see UpdateMsgs or real-time updates  reflecting changes in the market. All messages between the application and Refinitiv Real-Time - Optimized are in JSON format, you can find more detail regarding the WebSocket API's JSON message format in [WebSocket API Specifications Guide](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api/documentation#web-socket-api-developer-guide) link. 
    ```
    Sending Market Price request on session1 for /EUR= item
    Sent on session1:
    {
    "ID": 2,
    "Key": {
        "Name": "/EUR="
    }
    }
    Receive Market Price Refresh Message on session1: {
    "ID": 2,
    "Type": "Refresh",
    "Key": {
        "Service": "ELEKTRON_DD",
        "Name": "/EUR="
    },
    "State": {
        "Stream": "Open",
        "Data": "Ok",
        "Text": "*All is well"
    },
    "Qos": {
        "Timeliness": "Realtime",
        "Rate": "JitConflated"
    },
    "PermData": "AwEBITw=",
    "SeqNumber": 20846,
    "Fields": {
        "PROD_PERM": 213,
        "RDNDISPLAY": 153,
        "DSPLY_NAME": "INTERPROMBAN MOW",
        "TIMACT": "10:39:00",
        "NETCHNG_1": 0.0062,
        "HIGH_1": 1.1388,
        "LOW_1": 1.1308,
        "CURRENCY": "USD",
        "ACTIV_DATE": "2018-11-01",
        "OPEN_PRC": 1.1309,
        "HST_CLOSE": 1.131,
        "BID": 1.1372,
        "BID_1": 1.1371,
        "BID_2": 1.1373,
        "ASK": 1.1374,
        "ASK_1": 1.1375,
        ...
        "BIDLO5_MS": null,
        "MIDHI1_MS": "09:03:53.395",
        "MIDLO1_MS": "21:01:01.479",
        "BID_HR_MS": "10:00:01.078"
    }
    }

    Receive Update Message on session1: {
    "ID": 2,
    "Type": "Update",
    "UpdateType": "Unspecified",
    "DoNotConflate": true,
    "Key": {
        "Service": "ELEKTRON_DD",
        "Name": "/EUR="
    },
    "SeqNumber": 20894,
    "Fields": {
        "PCTCHG_3M": -2.44,
        "PCTCHG_6M": -4.83,
        "PCTCHG_MTD": 0.56,
        "PCTCHG_YTD": -5.19
    }
    }
    ```
8. You can (Ctrl+C) to exit the application at any time.

All Command-line Option Descriptions:

* ```--user```            ```<REQUIRED>``` Username to use when authenticating via Username/Password to the Gateway.
* ```--password```        ```<REQUIRED>``` Password to use when authenticating via Username/Password to the Gateway.
* ```--clientid```         ```<REQUIRED>``` Client ID aka AppKey generated using AppGenerator, to use when authenticating with Gateway.
* ```--hotstandby```      ```<OPTIONAL>``` Specifies the hotstandby mechanism to create two connections and subscribe identical items for service resiliency.
* ```--auth_hostname```   ```<OPTIONAL>``` Hostname of the RDP Gateway.
* ```--auth_port```       ```<OPTIONAL>``` Port of the RDP Gateway. Defaults to 443
* ```--scope```           ```<OPTIONAL>``` An authorization scope to include when authenticating. Defaults to 'trapi'
* ```--ric```             ```<OPTIONAL>``` Name of the item to request from the Refinitiv Real-Time Service. If not specified, /EUR= is requested.
* ```--app_id```          ```<OPTIONAL>``` Application ID to use when logging in. If not specified, "256" is used.
* ```--position```        ```<OPTIONAL>``` Position to use when logging in. If not specified, the current host is used.

## <a id="run_app_docker"></a>How to run the application in Docker

The Docker Desktop/Engine application should be installed and run properly on your machine. For Windows 10, please refer to this [Install Docker Desktop on Windows](https://docs.docker.com/docker-for-windows/install/) page.

1. Unzip or download the example project folder into a directory of your choice 
2. Run the [Docker build](https://docs.docker.com/engine/reference/commandline/build/) command to build the Docker image named *developers/node_streamingjs*.
    ```
    $> docker build . -t developers/node_streamingjs
    ```
3. Once Docker build success, use the [Docker run](https://docs.docker.com/engine/reference/run/) command to start the Docker container to run application.
    ```
    $> docker run developers/node_streamingjs --user <Machine-ID> --password <Password> --clientid <App key> --ric <Interested RIC code (optional)>
    ```
4. The result will be the same as the above section.

## <a id="references"></a>References
For further details, please check out the following resources:
* [Refinitiv Real-Time & Distribution Family page](https://developers.refinitiv.com/en/use-cases-catalog/refinitiv-real-time) on the [Refinitiv Developer Community](https://developers.refinitiv.com/) web site.
* [WebSocket API page](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api).
* [Refinitiv WebSocket API: Quick Start - Connecting to Refinitiv Real-Time - Optimized](https://developers.refinitiv.com/en/api-catalog/elektron/refinitiv-websocket-api/quick-start#connecting-to-refinitiv-real-time-optimized). 
* [Developer Webinar Recording: Introduction to Websocket API](https://www.youtube.com/watch?v=CDKWMsIQfaw).
* [Refinitiv Data Model Discovery page](https://refinitiv.fixspec.com/specserver/specs/elektron): Explore data models, content definitions and data update behaviors.
* [TypeScript programming language: Documentation](https://www.typescriptlang.org/docs/home.html).
* [Node.js Documentation](https://nodejs.org/dist/latest-v10.x/docs/api/).
* [Mozilla Developer Network: WebSocket API page](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).
* [Developer Article: How to implement WebSocket API JavaScript application with TypeScript](https://developers.refinitiv.com/en/article-catalog/article/how-to-implement-elektron-websocket-api-javascript-application-typescript).

For any question related to this article or RDP/Refinitiv Real-Time - Optimized API, please use the Developer Community [Q&A Forum](https://community.developers.refinitiv.com/spaces/231/view.html).


