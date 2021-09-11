/* eslint-disable no-unused-vars */

import {
  Application,
  Dispatch,
  Event,
  Guild,
  GuildCreate,
  MessageCreate,
  Ready,
  Snowflake,
  TypingStart,
  VoiceStateUpdate,
} from 'discord-models';
import { File } from './models/file';
import dotenv from 'dotenv';
import { URL } from 'url';
import { Core } from './models/core';
import { ApplicationCommand } from 'discord-models';
import { HttpClient } from './rest/httpClient';
import { OutgoingHttpAuthorizationHeaderPair, OutgoingHttpBasicHeaderPair } from './rest/outgoingHttpHeaderPair';
import { GatewayClient } from './websocket/gatewayClient';
import { DiscordEndpoint, GuildEndpoint } from './rest/endpoint';

/**
 * Open the connection to Discord
 */
async function start() {
  try {
    const file: File = new File('./.env');
    await file.open();
    await file.close();
  }
  catch (error: any) {
    if (error.code === 'EEXIST') { } else throw error;
  }

  dotenv.config();
  const token: string = process.env.TOKEN ?? '';
  console.log(`Token: ${token}`);

  const endpoint: DiscordEndpoint = new DiscordEndpoint(new URL('https://discord.com'));

  const httpClient = new HttpClient(
      endpoint.url,
      [
        new OutgoingHttpAuthorizationHeaderPair('Authorization', 'Bot', token),
        new OutgoingHttpBasicHeaderPair('User-Agent', 'DiscordBot ($https://github.com/natelatchaw/client, $0.0.1)'),
        new OutgoingHttpBasicHeaderPair('Content-Type', 'application/json'),
      ],
  );
  const gatewayClient = new GatewayClient(
      new URL('wss://gateway.discord.gg/?v=9&encoding=json'),
  );

  const core: Core = new Core(httpClient, gatewayClient, token);
  core.onDispatch(async (dispatch: Dispatch<Event>) => {
    // if the dispatch's event code is undefined, return
    if (dispatch.t == undefined) return;
    // const event: Event = dispatch.d;
    console.log(dispatch.t);
    if (dispatch.t == 'READY') {
      const ready: Ready = dispatch.d as Ready;
      const application_id: Snowflake = ready.application.id;
      const auth: URL = getAuthorizationLink(application_id, endpoint);
      console.log(auth.toString());
      const application: Application = await getApplication(application_id, httpClient, endpoint);
      console.log(application);
    }

    if (dispatch.t == 'GUILD_CREATE') {
      const guild_create: GuildCreate = dispatch.d as GuildCreate;
      const guild_id: Snowflake | null = guild_create.id;
      if (guild_id) {
        const guild: Guild = await getGuild(guild_id, httpClient, endpoint);
        console.log('Received Guild', guild.name);
      }
    }

    if (dispatch.t == 'MESSAGE_CREATE') {
      const message_create: MessageCreate = dispatch.d as MessageCreate;
      console.log('Received Message', message_create.content);
    }

    if (dispatch.t == 'TYPING_START') {
      const typing_start: TypingStart = dispatch.d as TypingStart;
      console.log('Typing Started by', typing_start.member?.user?.username);
    }

    if (dispatch.t == 'VOICE_STATE_UPDATE') {
      const voice_state_update: VoiceStateUpdate = dispatch.d as VoiceStateUpdate;
      console.log(voice_state_update);
    }
  });
}

/**
 * @async
 * @function
 * @param { Snowflake } guild_id
 * @param { HttpClient } httpClient
 * @param { DiscordEndpoint } endpoint
 * @return { Promise<Guild> }
 */
async function getGuild(guild_id: Snowflake, httpClient: HttpClient, endpoint: DiscordEndpoint): Promise<Guild> {
  const guildEndpoint = endpoint.version(8).guild(guild_id);
  const path: string = guildEndpoint.url.pathname.slice(0, -1);
  return await httpClient.get<Guild>(path);
}

/**
 * @async
 * @function
 * @param { Snowflake } application_id
 * @param { HttpClient } httpClient
 * @param { DiscordEndpoint } endpoint
 * @return { Promise<Application> }
 */
async function getApplication(application_id: Snowflake, httpClient: HttpClient, endpoint: DiscordEndpoint): Promise<Application> {
  const applicationEndpoint = endpoint.oauth().applications();
  const path: string = applicationEndpoint.url.pathname.slice(0, -1);
  return await httpClient.get<Application>(path);
}

/**
 * @param { Snowflake } application_id
 * @param { DiscordEndpoint } endpoint
 * @return { string }
 */
function getAuthorizationLink(application_id: Snowflake, endpoint: DiscordEndpoint): URL {
  const authorizationEndpoint = endpoint.oauth().authorize(application_id, 1);
  return authorizationEndpoint.url;
}

/**
 * @param { Snowflake } application_id
 * @param { Snowflake } guild_id
 * @param { HttpClient } httpClient
 */
async function registerCommand(application_id: Snowflake, guild_id: Snowflake, httpClient: HttpClient) {
  const command: ApplicationCommand = {
    id: '',
    application_id: application_id,
    name: 'test',
    description: 'test command for the slash command system',
    options: [
      {
        name: 'option-one',
        description: 'description for option one',
        type: 3,
        required: true,
        choices: [
          {
            name: 'selection-one',
            value: 'selection-one',
          },
          {
            name: 'selection-two',
            value: 'selection-two',
          },
        ],
      },
    ],
  };
  const path: string = new DiscordEndpoint(new URL('https://discord.com')).version(8).application(application_id).guild(guild_id).command('866183522376482846').url.pathname;
  // const path: string = `/api/v8/applications/${application_id}/guilds/${guild_id}/commands/866183522376482846`;
  console.log(JSON.stringify(command));
  await httpClient.delete<ApplicationCommand>(path)
      .then(() => console.log({ command }))
      .catch((error: any) => console.error(error));
}


start()
    .then(() => console.log('Complete.'))
    .catch((error: Error) => console.error(error));

/*
const url: URL = new URL('https://discord.com');
const application_id: Snowflake = '243890298669802';
const guild_id: Snowflake = '82390489023';
// const application = new DiscordEndpoint(url).version(8).application(application_id).guild(guild_id).command('8903289042');
const application = new DiscordEndpoint(url).oauth().authorize(application_id, 1);
console.log(application.url);
*/
