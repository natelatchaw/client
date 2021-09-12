/* eslint-disable no-unused-vars */

import {
  Snowflake,
} from 'discord-models';
import dotenv from 'dotenv';
import { URL } from 'url';
import { ApplicationCommand } from 'discord-models';
import { HttpClient } from './rest/httpClient';
import { OutgoingHttpAuthorizationHeaderPair, OutgoingHttpBasicHeaderPair } from './rest/outgoingHttpHeaderPair';
import { GatewayClient } from './websocket/gatewayClient';
import { DiscordEndpoint } from './rest/endpoint';
import { DotenvConfigOptions } from 'dotenv';
import { Bot } from './models/bot';
import { PathLike } from 'fs';

const isDev: boolean = false;
const env: PathLike = isDev ? './.dev.env' : './.prod.env';
// set dotenv options
const options: DotenvConfigOptions = { path: env, encoding: 'utf-8', debug: false };
// load env into process.env
dotenv.config(options);
const token: string = process.env.TOKEN ?? '';
const url: URL = new URL('https://discord.com');
const endpoint = new DiscordEndpoint(url);
const httpClient = new HttpClient(
    url,
    [
      new OutgoingHttpAuthorizationHeaderPair('Authorization', 'Bot', token),
      new OutgoingHttpBasicHeaderPair('User-Agent', 'DiscordBot ($https://github.com/natelatchaw/client, $0.0.1)'),
      new OutgoingHttpBasicHeaderPair('Content-Type', 'application/json'),
    ],
);
const gatewayClient = new GatewayClient(
    new URL('wss://gateway.discord.gg/?v=9&encoding=json'),
);
const bot: Bot = new Bot(endpoint, httpClient, gatewayClient, token);


bot.start()
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
