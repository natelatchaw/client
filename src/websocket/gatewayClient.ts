import WebSocket from 'ws';
import { URL } from 'url';
import { Heartbeat } from 'discord-models';
import { Rejection } from '../models/rejection';
import { Resolution } from '../models/resolution';

/**
 * @class GatewayClient
 */
export class GatewayClient {
  /**
   * @property { URL } endpoint
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
   * @property { WebSocket } websocket
   */
  private webSocket: WebSocket;

  /**
   * @property { number } sequence
   */
  public sequence: number;

  /**
   * @constructor
   * @param { URL } endpoint
   */
  public constructor(
    private _endpoint: URL,
  ) {
    this.webSocket = new WebSocket(this.endpoint);
    this.sequence = 0;
  }

  /**
   * @callback onCloseCallback
   * @param { void }
   * @return { void }
   */
  /**
   * @event onOpen
   * @param { onCloseCallback } listener
   * @return { WebSocket }
   */
  public onOpen = (listener: () => void): WebSocket => this.webSocket.on('open', listener);

  /**
   * @callback onCloseCallback
   * @param { number } code
   * @param { string } reason
   * @return { void }
   */
  /**
   * @event onClose - Event invoked on receipt of websocket close
   * @param { onCloseCallback } listener
   * @return { WebSocket }
   */
  public onClose = (listener: (code: number, reason: string) => void): WebSocket => this.webSocket.on('close', listener);

  /**
   * @callback onMessageCallback
   * @param { WebSocket.Data } data
   * @return { void }
   */
  /**
   * @event onMessage
   * @param { onMessageCallback } listener
   * @return { WebSocket }
   */
  public onMessage = (listener: (data: WebSocket.Data) => void): WebSocket => this.webSocket.on('message', listener);

  /**
   * @function send
   * @param { string } data
   * @param { number } timeout
   * @return { Promise<void> }
   */
  public async send(data: string, timeout: number = 0): Promise<void> {
    return new Promise((resolve: Resolution<void>, reject: Rejection) => {
      this.webSocket.send(data, (error?: Error) => {
        if (error) reject(error);
        else setTimeout(resolve, timeout);
      });
    });
  }

  /**
   * @function beat
   * @param { number } interval
   * @return { Promise<void> }
   */
  public async beat(interval: number): Promise<void> {
    const payload: Heartbeat = {
      op: 1,
      d: ++this.sequence,
      s: null,
      t: null,
    };
    const data: string = JSON.stringify(payload);
    return this.send(data, interval);
  }

  /**
   * @function close
   * @param { number | undefined } code
   * @param { string | undefined } data
   */
  public close(code?: number, data?: string): void {
    this.webSocket.close(code, data);
  }
}
