/* eslint-disable guard-for-in */
/* eslint-disable indent */
/* eslint-disable brace-style */
/* eslint-disable block-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars */
/* eslint-disable no-array-constructor */
/* eslint-disable max-len */

import { ClientRequest, IncomingMessage, OutgoingHttpHeader } from 'http';
import * as https from 'https';
import { RequestOptions } from 'https';
import { Dictionary } from './dictionary';
import { OutgoingHttpHeaderPair } from './outgoingHttpHeaderPair';

/**
 * @interface OutgoingHttpHeaders
 */
interface OutgoingHttpHeaders extends Dictionary<OutgoingHttpHeader> { }

/**
 * @class HttpClient
 */
export class HttpClient {
    /** @property { URL } url */
    public url: URL;

    /** @property { Array<OutgoingHttpHeaderPair> } headerPairs */
    public headerPairs: Array<OutgoingHttpHeaderPair>;

    /**
     * @property { string } hostname
     */
    public get hostname(): string {
        return this.url.hostname;
    }
    /**
     * @property { string } hostname
     * @param { string } value
     */
    public set hostname(value: string) {
        this.url.hostname = value;
    }

    /**
     * @property { string } port
     */
    public get port(): string {
        return this.url.port;
    }
    /**
     * @property { string } port
     * @param { string } value
     */
    public set port(value: string) {
        this.url.port = value;
    }

    /**
     * @property { string | undefined } token
     */
    public get token(): string | undefined {
        // get all headers with an Authorization key
        const authorizationHeaders: Array<OutgoingHttpHeaderPair> = this.headerPairs.filter((headerPair: OutgoingHttpHeaderPair) => headerPair.key === 'Authorization');
        // get the first header from the filtered headers
        const authorizationHeaderPair: OutgoingHttpHeaderPair | undefined = authorizationHeaders.pop();
        // return the credential section
        return authorizationHeaderPair?.credentials;
    }

    /**
     * @property { string } token
     * @param { string | undefined } value
     */
    public set token(value: string | undefined) {
        // get all headers with an authorization key
        const authorizationHeaders: Array<OutgoingHttpHeaderPair> = this.headerPairs.filter((headerPair: OutgoingHttpHeaderPair) => headerPair.key === 'Authorization');
        // remove all existing authorization headers from the list of headers
        authorizationHeaders.forEach((authorizationHeader: OutgoingHttpHeaderPair) => this.headerPairs.splice(this.headerPairs.indexOf(authorizationHeader), 1));
        // push a new authorization header
        if (value) this.headerPairs.push(new OutgoingHttpHeaderPair('Authorization', 'Bot', value));
    }

    /**
     * @property { OutgoingHttpHeaders } headers - assembled headers to be used in an API call
     * */
    public get headers(): OutgoingHttpHeaders {
        // create a new header dictionary
        const outgoingHttpHeaders: Dictionary<OutgoingHttpHeader> = new Dictionary<OutgoingHttpHeader>();
        // add each header to the dictionary
        this.headerPairs.forEach((header: OutgoingHttpHeaderPair) => outgoingHttpHeaders[header.key] = header.value);
        return outgoingHttpHeaders;
    }

    /**
     * @property { OutgoingHttpHeaders } headers
     * @param { OutgoingHttpHeaders } value
     */
    public set headers(value: OutgoingHttpHeaders) {
        const headers: Dictionary<OutgoingHttpHeader> = value as Dictionary<OutgoingHttpHeader>;
        for (const headerKey in headers) {
            const headerValue: OutgoingHttpHeader = headers[headerKey];
            this.headerPairs.push(new OutgoingHttpHeaderPair(headerKey, headerValue));
        }
    }

    /**
     * @property { RequestOptions } options - contains connection details to make API calls.
     */
    public get options(): RequestOptions {
        return {
            hostname: this.hostname,
            port: this.port,
            headers: this.headers,
        };
    }
    /**
     * @property { RequestOptions } options - contains connection details to make API calls.
     * @param { RequestOptions } value - the value to set options to
     */
    public set options(value: RequestOptions) {
        if (value.hostname) this.hostname = value.hostname;
        if (value.port) this.port = value.port.toString();
        this.headers = value.headers as OutgoingHttpHeaders;
    }

    /**
     * @constructor
     * @param { string } hostname - the hostname to connect to
     * @param { string | number } port - the port to connect to
     * @param { string } token - the token to use as the bearer token
     * @param { Array<OutgoingHttpHeaderPair> } headerPairs - an array of headers to include with the request
     */
    public constructor(
        hostname: string,
        port: string | number,
        token: string,
        headerPairs: Array<OutgoingHttpHeaderPair> = new Array<OutgoingHttpHeaderPair>(),
    ) {
        this.url = new URL(`https://${hostname}`);
        this.hostname = hostname;
        this.port = port.toString();
        this.headerPairs = headerPairs;
        this.token = token;
    }

    /**
     * @method addHeader
     * @param { OutgoingHttpHeaderPair } header - the header to add
     */
    public addHeader(header: OutgoingHttpHeaderPair) {
        this.headerPairs.push(header);
    }

    /**
     * @method get
     * @param { string } path
     * @param { IncomingMessage } callback
     * @return { Promise<string> }
     */
    public get<T>(path: string): Promise<T> {
        const options = this.options;
        options.path = path;

        return new Promise((resolve, reject) => {
            const request: ClientRequest = https.get(options, (message: IncomingMessage) => {
                let buffer: string = '';
                // if (message.statusCode != 200) { reject(new Error(message.statusCode.toString())); }
                message.on('data', (chunk: string) => buffer += chunk);
                message.on('end', () => resolve(JSON.parse(buffer) as T));
                message.on('error', (error: Error) => reject(error));
            });
        });
    }
}
