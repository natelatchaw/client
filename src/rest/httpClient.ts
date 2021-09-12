/* eslint-disable no-unused-vars */
/* eslint-disable no-array-constructor */
/* eslint-disable guard-for-in */

import { ClientRequest, IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders } from 'http';
import * as https from 'https';
import { RequestOptions } from 'https';
import { Dictionary } from '../models/dictionary';
import { OutgoingHttpAuthorizationHeaderPair, OutgoingHttpHeaderPair } from './outgoingHttpHeaderPair';
import { Rejection } from '../models/rejection';
import { Resolution } from '../models/resolution';

/**
 * @class HttpClient
 */
export class HttpClient {
  /**
     * @property { URL } url
     */
  public get endpoint(): URL {
    return this._endpoint;
  }

  /**
     * @property { string } hostname
     */
  public get hostname(): string {
    return this._endpoint.hostname;
  }
  /**
     * @property { string } hostname
     * @param { string } value
     */
  public set hostname(value: string) {
    this._endpoint.hostname = value;
  }

  /**
     * @property { string } port
     */
  public get port(): string {
    return this._endpoint.port;
  }
  /**
     * @property { string } port
     * @param { string } value
     */
  public set port(value: string) {
    this._endpoint.port = value;
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
      if (value) this.headerPairs.push(OutgoingHttpAuthorizationHeaderPair.generate(key, value));
    }
  }

    /**
     * @property { Array<OutgoingHttpHeaderPair> } headerPairs
     */
    public headerPairs: Array<OutgoingHttpHeaderPair>;

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
     * @param { URL } _endpoint - the base url to connect to
     * @param { Array<OutgoingHttpHeaderPair> } headerPairs - HTTP headers to use when making requests
     */
    public constructor(
      private _endpoint: URL,
      headerPairs: Array<OutgoingHttpHeaderPair> = new Array<OutgoingHttpHeaderPair>(),
    ) {
      this.headerPairs = headerPairs;
    }

    /**
     * @method addHeader
     * @param { OutgoingHttpAuthorizationHeaderPair } header - the header to add
     */
    public addHeader(header: OutgoingHttpAuthorizationHeaderPair) {
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
          console.debug(message.statusCode, message.statusMessage, options.method, options.path);
          let buffer: string = '';
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
          console.debug(message.statusCode, message.statusMessage, options.method, options.path);
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
          console.debug(message.statusCode, message.statusMessage, options.method, options.path);
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
