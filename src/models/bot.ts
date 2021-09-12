import { Snowflake, Dispatch, Ready, Application, GuildCreate, Guild, MessageCreate, TypingStart, VoiceStateUpdate, ApplicationCommand } from 'discord-models';
import { DiscordEndpoint } from '../rest/endpoint';
import { HttpClient } from '../rest/httpClient';
import { GatewayClient } from '../websocket/gatewayClient';
import { Core } from './core';
import { Event } from 'discord-models';

/**
 * @class
 */
export class Bot extends Core {
    /**
     * @property { DiscordEndpoint } endpoint
     */
    public endpoint: DiscordEndpoint;

    /**
     * @property { Snowflake | undefined } application_id;
     */
    public application_id?: Snowflake;

    /**
     * @constructor
     * @param { DiscordEndpoint } endpoint
     * @param { HttpClient } httpClient
     * @param { GatewayClient } gatewayClient
     * @param { string } token
     */
    public constructor(
        endpoint: DiscordEndpoint,
        httpClient: HttpClient,
        gatewayClient: GatewayClient,
        token: string,
    ) {
      super(httpClient, gatewayClient, token);
      // set the REST endpoint
      this.endpoint = endpoint;
    }

    /**
     * @property { URL | undefined } invite_link
     */
    public get invite_link(): URL | undefined {
      if (this.application_id == undefined) return;
      const authorizationEndpoint = this.endpoint.oauth().authorize(this.application_id, 1);
      return authorizationEndpoint.url;
    }

    /**
     * @async
     * @function start
     */
    public async start() {
      console.log('Token:', this.token);

      // const core: Core = new Core(httpClient, gatewayClient, this.token);
      this.onDispatch(async (dispatch: Dispatch<Event>) => {
        // if the dispatch's event code is undefined, return
        if (dispatch.t == undefined) return;
        // const event: Event = dispatch.d;
        console.log(dispatch.t);
        if (dispatch.t == 'READY') {
          const ready: Ready = dispatch.d as Ready;
          this.application_id = ready.application.id;
          const application: Application = await this.getApplication();
          console.log('Received Application:', application.name);
        }

        if (dispatch.t == 'GUILD_CREATE') {
          const guild_create: GuildCreate = dispatch.d as GuildCreate;
          const guild_id: Snowflake | null = guild_create.id;
          if (guild_id) {
            const guild: Guild = await this.getGuild(guild_id);
            console.log('Received Guild:', guild.name);
          }
        }

        if (dispatch.t == 'MESSAGE_CREATE') {
          const message_create: MessageCreate = dispatch.d as MessageCreate;
          console.log('Received Message:', message_create.content);
        }

        if (dispatch.t == 'TYPING_START') {
          const typing_start: TypingStart = dispatch.d as TypingStart;
          console.log('Typing Started by', typing_start.member?.user?.username);
        }

        if (dispatch.t == 'VOICE_STATE_UPDATE') {
          const voice_state_update: VoiceStateUpdate = dispatch.d as VoiceStateUpdate;
          console.log('Voice State update from:', voice_state_update.member?.user?.username);
        }
      });
    }

    /**
     * @function getToken
     * @return { Promise }
     */
    public async getToken(): Promise<any> {
      const tokenEndpoint = this.endpoint.oauth().token();
      const path: string = tokenEndpoint.url.pathname.slice(0, -1);
      return await this.httpClient.get<any>(path);
    }

    /**
     * @async
     * @function getApplication
     * @return { Promise<Application> }
     */
    public async getApplication(): Promise<Application> {
      const applicationEndpoint = this.endpoint.oauth().applications();
      const path: string = applicationEndpoint.url.pathname.slice(0, -1);
      return await this.httpClient.get<Application>(path);
    }

    /**
     * @async
     * @function
     * @param { Snowflake } guild_id
     * @return { Promise<Guild> }
     */
    public async getGuild(guild_id: Snowflake): Promise<Guild> {
      const guildEndpoint = this.endpoint.version(8).guild(guild_id);
      const path: string = guildEndpoint.url.pathname.slice(0, -1);
      return await this.httpClient.get<Guild>(path);
    }

    /**
     * @param { Snowflake } guild_id
     * @param { ApplicationCommand } command
     */
    public async setCommand(guild_id: Snowflake, command: ApplicationCommand) {
      const application: Application = await this.getApplication();
      const guild: Guild = await this.getGuild(guild_id);
      const endpoint = this.endpoint.version(8).application(application.id).guild(guild.id).command(command.id);
      await this.httpClient.post<ApplicationCommand>(endpoint.url.pathname, command);
    }

    /**
     * @return { Promise<URL> }
     */
    public async getInviteLink(): Promise<URL> {
      const application: Application = await this.getApplication();
      const authorizationEndpoint = this.endpoint.oauth().authorize(application.id, 1);
      return authorizationEndpoint.url;
    }
}
