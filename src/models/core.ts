import { URL } from 'url';
import WebSocket from 'ws';
import { GatewayClient } from '../websocket/gatewayClient';
import { GatewayPayload } from 'discord-models';
import { Dispatch } from 'discord-models';
import { Hello } from 'discord-models';
import { Identify } from 'discord-models';
import { Resume, ResumeData } from 'discord-models';
import { Event } from 'discord-models';
import { HttpClient } from '../rest/httpClient';

/**
 * @class Core
 */
export class Core {
  private token: string;
  private gatewayClient: GatewayClient;
  private httpClient: HttpClient;
  private interval: number = Number.MAX_SAFE_INTEGER;
  private acknowledged: boolean;
  private session_id?: string;

  /**
   * @constructor
   * @param { HttpClient } httpClient
   * @param { GatewayClient } gatewayClient
   * @param { string } token
   */
  public constructor(
      httpClient: HttpClient,
      gatewayClient: GatewayClient,
      token: string,
  ) {
    this.token = token;
    this.gatewayClient = gatewayClient;
    this.httpClient = httpClient;
    this.attachListeners();
    this.acknowledged = false;
  }

  /**
   * @return { void }
   */
  private attachListeners(): void {
    this.gatewayClient.onMessage(this.onMessage);
    this.gatewayClient.onClose(this.onClose);
  }

  /**
   * Send a payload object via WebSocket message
   * @param { GatewayPayload } payload
   * @return { Promise<void> }
   */
  public async send(payload: GatewayPayload): Promise<void> {
    const data: string = JSON.stringify(payload);
    return this.gatewayClient.send(data);
  }

  // #region EVENTS

  /**
   * @event onMessage - Event invoked on receipt of websocket message
   * @param { WebSocket.Data } data
   */
  private onMessage = async (data: WebSocket.Data) => {
    const payload: GatewayPayload = JSON.parse(data.toString());
    console.log(`RECV OPCODE ${payload.op}`);
    // Console.warn(JSON.stringify(payload));
    // if (payload.op == 0) await this.onDispatch(payload as Dispatch<Event>);
    if (payload.op == 1) await this.onHeartbeat();
    if (payload.op == 10) await this.onHello(payload as Hello);
    if (payload.op == 11) this.acknowledged = true;
  }

  /**
   * @event onClose - Event invoked on receipt of websocket close
   * @param { number } code
   * @param { string } reason
   */
  public onClose = (code: number, reason: string): void => {
    console.log(`RECV CLCODE ${code}: ${reason}`);
  }

  /**
   * @callback onDispatchCallback
   * @param { Dispatch<Event> } dispatch
   */
  /**
   * @event onDispatch
   * @param { onDispatchCallback } listener
   * @return { void }
   */
  public onDispatch = (listener: (dispatch: Dispatch<Event>) => void): void => {
    this.gatewayClient.onMessage((data: WebSocket.Data) => {
      // parse the data to a Payload object
      const payload: GatewayPayload = JSON.parse(data.toString()) as GatewayPayload;
      // if the Payload object is not a Dispatch object, return
      if (payload.op !== 0) return;
      // parse the data to a Dispatch object
      const dispatch: Dispatch<Event> = JSON.parse(data.toString()) as Dispatch<Event>;
      // pass the Dispatch object
      listener(dispatch);
    });
  }

  // #endregion

  // #region OPCODE RESPONSES

  /**
   * Invoked on receipt of OPCODE 1 HEARTBEAT
   */
  private async onHeartbeat() {
    await this.gatewayClient.beat(this.interval);
  }

  /**
   * Invoked on receipt of OPCODE 10 HELLO
   * @param { Hello } payload
   */
  private async onHello(payload: Hello) {
    this.interval = payload.d.heartbeat_interval;
    await this.identify();
    while (true) {
      this.acknowledged = false;
      await this.gatewayClient.beat(this.interval);
      if (this.acknowledged) continue;
      else this.reconnect();
    }
  }

  /**
   * Invoke to reset the websocket and attempt to resume
   */
  public async reconnect() {
    const endpoint: URL = this.gatewayClient.endpoint;
    this.gatewayClient.close(1012);
    this.gatewayClient = new GatewayClient(endpoint);
    if (this.session_id == undefined) return;
    const data: ResumeData = { token: this.token, session_id: this.session_id, seq: this.gatewayClient.sequence };
    const payload: Resume = { op: 6, d: data, s: null, t: null };
    await this.send(payload);
  }

  // #endregion

  // #region CONNECTION MANAGEMENT

  /**
   * Invoke to authenticate to the websocket
   */
  private async identify() {
    const intents: number = 32509;
    const payload: Identify = {
      op: 2,
      d: {
        token: this.token,
        properties: {
          '$os': 'linux',
          '$browser': 'library',
          '$device': 'library',
        },
        intents: intents,
      },
      s: null,
      t: null,
    };
    await this.send(payload);
  }

  // #endregion
}
