/* eslint-disable no-unused-vars */

import {
  Dispatch,
  Event,
  Guild,
  GuildCreate,
  Snowflake,
} from 'discord-models';
import { File } from './models/file';
import dotenv from 'dotenv';
import { URL } from 'url';
import { Core } from './models/core';
import { ApplicationCommand } from 'discord-models';
import { HttpClient } from './models/httpClient';
import { OutgoingHttpHeaderPair } from './models/outgoingHttpHeaderPair';

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
  const endpoint: URL = new URL('wss://gateway.discord.gg/?v=9&encoding=json');
  const token: string = process.env.TOKEN ?? '';
  console.log(`Token: ${token}`);
  const core: Core = new Core(endpoint, token);
  core.onDispatch(async (dispatch: Dispatch<Event>) => {
    // if the dispatch's event code is undefined, return
    if (dispatch.t == undefined) return;
    // const event: Event = dispatch.d;
    console.log(dispatch.t);
    if (dispatch.t == 'GUILD_CREATE') {
      const guild_create: GuildCreate = dispatch.d as GuildCreate;
      const application_id: Snowflake | null = guild_create.application_id ?? '770445843291045928';
      const guild_id: Snowflake | null = guild_create.id;
      console.log(application_id, guild_id);
      if (application_id && guild_id) await getGuild(application_id, guild_id, token);
    }
  });
}

/**
 * @async
 * @function
 * @param { Snowflake } application_id
 * @param { Snowflake } guild_id
 * @param { string } token
 */
async function getGuild(application_id: Snowflake, guild_id: Snowflake, token: string) {
  const path: string = `/api/v8/guilds/${guild_id}`;
  const httpClient: HttpClient = new HttpClient(
      new URL('https://discord.com/api'),
      token,
      [
        new OutgoingHttpHeaderPair('User-Agent', 'DiscordBot', 'https://github.com/natelatchaw/client 0.0.1'),
        new OutgoingHttpHeaderPair('Content-Type', 'application/json', undefined),
      ],
  );
  await httpClient.get<Guild>(path)
      .then((response: Guild) => console.log(response))
      .catch((error: any) => console.error(error));
}

/**
 * @param { Snowflake } application_id
 * @param { Snowflake } guild_id
 * @param { string } token
 */
async function registerCommand(application_id: Snowflake, guild_id: Snowflake, token: string) {
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
  const path: string = `/v8/applications/${application_id}/guilds/${guild_id}/commands/866183522376482846`;
  const httpClient: HttpClient = new HttpClient(
      new URL('https://discord.com/api'),
      token,
      [
        new OutgoingHttpHeaderPair('User-Agent', 'DiscordBot', 'https://github.com/natelatchaw/client 0.0.1'),
        new OutgoingHttpHeaderPair('Content-Type', 'application/json', undefined),
      ],
  );
  console.log(JSON.stringify(command));
  await httpClient.delete<ApplicationCommand>(path)
      .then(() => console.log({command}))
      .catch((error: any) => console.error(error));
}

start()
    .then(() => console.log('Complete.'))
    .catch((error: Error) => console.error(error));
