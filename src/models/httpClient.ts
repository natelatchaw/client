/* eslint-disable no-new-wrappers */
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
 * @type Resolution
 * @summary
 * Represents the resolve callback event type.
 */
export type Resolution<T> = (value: T | Promise<T>) => void;

/**
 * @type Rejection
 * @summary
 * Represents the reject callback event type.
 */
export type Rejection = (reason?: any) => void;

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
     */
    public get headers(): OutgoingHttpHeaders {
        // create a new header dictionary
        const outgoingHttpHeaders: Dictionary<OutgoingHttpHeader> = new Dictionary<OutgoingHttpHeader>();
        // add each header to the dictionary
        this.headerPairs.forEach((header: OutgoingHttpHeaderPair) => outgoingHttpHeaders[header.key] = header.value);
        // return the header dictionary
        return outgoingHttpHeaders;
    }

    /**
     * @property { OutgoingHttpHeaders } headers
     * @param { OutgoingHttpHeaders } value
     */
    public set headers(value: OutgoingHttpHeaders) {
        // cast value to Dictionary<OutgoingHttpHeader>
        const headers: Dictionary<OutgoingHttpHeader> = value as Dictionary<OutgoingHttpHeader>;
        // iterate through headers dictionary
        for (const key in headers) {
            // get each value via the key
            const value: OutgoingHttpHeader | undefined = headers[key];
            // generate OutgoingHttpHeaderPair with key and value and push to headerPairs array
            if (value) this.headerPairs.push(OutgoingHttpHeaderPair.generate(key, value));
        }
    }

    /**
     * @property { RequestOptions } options - contains connection details to make API calls.
     */
    public get options(): RequestOptions {
        return {
            hostname: this.url.hostname,
            port: this.url.port,
            headers: this.headers,
        };
    }
    /**
     * @property { RequestOptions } options - contains connection details to make API calls.
     * @param { RequestOptions } value - the value to set options to
     */
    public set options(value: RequestOptions) {
        if (value.hostname) this.hostname = value.hostname;
        if (value.port) this.url.port = value.port.toString();
        this.headers = value.headers as OutgoingHttpHeaders;
    }

    /**
     * @constructor
     * @param { URL } url - the base url to connect to
     * @param { string } token - the token to use as the bearer token
     * @param { Array<OutgoingHttpHeaderPair> } headerPairs - an array of headers to include with the request
     */
    public constructor(
        url: URL,
        token: string,
        headerPairs: Array<OutgoingHttpHeaderPair> = new Array<OutgoingHttpHeaderPair>(),
    ) {
        this.url = url;
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
        const options: https.RequestOptions = this.options;
        options.method = 'GET';
        options.path = path;

        return new Promise((resolve: Resolution<T>, reject: Rejection) => {
            const request: ClientRequest = https.get(options, (message: IncomingMessage) => {
                let buffer: string = '';
                // if (message.statusCode != 200) { reject(new Error(message.statusCode.toString())); }
                message.on('data', (chunk: string) => buffer += chunk);
                message.on('end', () => resolve(JSON.parse(buffer) as T));
                message.on('error', (error: Error) => reject(error));
            });
            request.end();
        });
    }

    /**
     * @method post
     * @param { string } path
     * @param { T } data
     * @return { Promise<void> }
     */
    public post<T>(path: string, data: T): Promise<void> {
        const options: https.RequestOptions = this.options;
        options.method = 'POST';
        options.path = path;

        return new Promise((resolve: Resolution<void>, reject: Rejection) => {
            const request: ClientRequest = https.request(options, (message: IncomingMessage) => {
                let buffer: string = '';
                message.on('data', (chunk: string) => buffer += chunk);
                message.on('end', () => resolve());
                message.on('error', (error: Error) => reject(error));
            });
            request.write(JSON.stringify(data));
            request.end();
        });
    }

    /**
     * @method delete
     * @param { string } path
     */
    public async delete<T>(path: string): Promise<void> {
        const options = this.options;
        options.method = 'DELETE';
        options.path = path;

        return new Promise((resolve: Resolution<void>, reject: Rejection) => {
            const request: ClientRequest = https.request(options, (message: IncomingMessage) => {
                let buffer: string = '';
                console.log(message.statusMessage);
                message.on('data', (chunk: string) => buffer += chunk);
                message.on('end', () => resolve());
                message.on('error', (error: Error) => reject(error));
            });
            request.end();
        });
    }
}
