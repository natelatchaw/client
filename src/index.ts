import {
  Dispatch,
  Event,
} from 'discord-models';
import { File } from './models/file';
import dotenv from 'dotenv';
import { URL } from 'url';
import { Core } from './models/core';

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
  core.onDispatch((dispatch: Dispatch<Event>) => {
    // if the dispatch's event code is undefined, return
    if (dispatch.t == undefined) return;
    // const event: Event = dispatch.d;
    console.log(dispatch.t);
  });
}

start()
    .then(() => console.log('Complete.'))
    .catch((error: Error) => console.error(error));
