import { Console } from 'discord-bot/dist';
import { Core } from 'discord-bot/dist';
import { File } from 'discord-bot/dist';
import { Dispatch } from 'discord-bot/dist/models/payloads/dispatch'
import { GuildCreate } from 'discord-bot/dist';
import { Heartbeat } from 'discord-bot/dist';
import dotenv from 'dotenv';
import { URL } from 'url';

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
    Console.log(`Token: ${token}`);
    const core: Core = new Core(endpoint, token);
    console.log(core);
    core.onDispatch((dispatch: Dispatch<Event>) => {
      Console.highlight(dispatch.t);
    });
    
  }
  
  start()
      .then(() => console.log('Complete.'))
      .catch((error: Error) => console.error(error));
  