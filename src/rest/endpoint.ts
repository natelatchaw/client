import { Snowflake } from '../../../discord-models/dist';

/**
 * @class
 */
export interface APIEndpoint {
    /**
     * @property { URL } url
     */
    url: URL;
}

/**
 * @class
 */
export class DiscordEndpoint implements APIEndpoint {
    /**
     * @property { URL } base
     */
    base: URL;

    /**
       * @property { URL } url
       */
    public get url(): URL {
      return new URL(`api/`, this.base);
    }

    /**
       * @constructor
       * @param { URL } base
       */
    public constructor(base: URL) {
      this.base = base;
    }

    /**
       * @param { number } version
       * @return { VersionEndpoint }
       */
    public version(version: number): VersionEndpoint<DiscordEndpoint> {
      return new VersionEndpoint(this, version);
    }
}

/**
 * @class
 */
export class VersionEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
    /**
     * @property { ParentEndpoint } parent
     */
    public parent: ParentEndpoint;

    /**
     * @property { number } version - the version of the Discord API to use
     */
    public version: number;

    /**
     * @property { URL } url
     */
    public get url(): URL {
      return new URL(`v${this.version}/`, this.parent.url);
    }

    /**
     * @constructor
     * @param { ParentEndpoint } parent
     * @param { number } version
     */
    public constructor(parent: ParentEndpoint, version: number) {
      this.version = version;
      this.parent = parent;
    }

    /**
     * @param { Snowflake } id
     * @return { ApplicationEndpoint }
     */
    public application(id: Snowflake): ApplicationEndpoint<VersionEndpoint<ParentEndpoint>> {
      return new ApplicationEndpoint(this, id);
    }

    /**
     * @param { Snowflake } id
     * @return { GuildEndpoint }
     */
    public guild(id: Snowflake): GuildEndpoint<VersionEndpoint<ParentEndpoint>> {
      return new GuildEndpoint(this, id);
    }
}

/**
 * @class
 */
export class ApplicationEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
    /**
     * @property { ParentEndpoint } parent
     */
    parent: ParentEndpoint;

    /**
     * @property { Snowflake } application_id - the application's snowflake id
     */
    application_id: Snowflake;

    /**
     * @property { URL } url
     */
    public get url(): URL {
      return new URL(`applications/${this.application_id}/`, this.parent.url);
    }

    /**
     * @constructor
     * @param { ParentEndpoint } parent
     * @param { Snowflake } application_id
     */
    public constructor(parent: ParentEndpoint, application_id: Snowflake) {
      this.parent = parent;
      this.application_id = application_id;
    }

    /**
     * @param { Snowflake } id
     * @return { GuildEndpoint }
     */
    public guild(id: Snowflake): GuildEndpoint<ApplicationEndpoint<ParentEndpoint>> {
      return new GuildEndpoint(this, id);
    }
}

/**
 * @class
 */
export class GuildEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
    /**
     * @property { ParentEndpoint } parent
     */
    parent: ParentEndpoint;

    /**
     * @property { Snowflake } guild_id - the guild's snowflake id
     */
    guild_id: Snowflake;

    /**
     * @property { URL } url
     */
    public get url(): URL {
      return new URL(`guilds/${this.guild_id}/`, this.parent.url);
    }

    /**
     * @constructor
     * @param { ParentEndpoint } parent
     * @param { Snowflake } guild_id
     */
    public constructor(parent: ParentEndpoint, guild_id: Snowflake) {
      this.parent = parent;
      this.guild_id = guild_id;
    }

    /**
     * @param { Snowflake } id
     * @return { CommandEndpoint<GuildEndpoint> }
     */
    public command(id: Snowflake): CommandEndpoint<GuildEndpoint<ParentEndpoint>> {
      return new CommandEndpoint(this, id);
    }
}

/**
 * @class
 */
export class CommandEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
    /**
     * @property { ParentEndpoint } parent
     */
    parent: ParentEndpoint;

    /**
     * @property { Snowflake } command_id - the command's snowflake id
     */
    command_id: Snowflake;

    /**
     * @property { URL } url
     */
    public get url(): URL {
      return new URL(`commands/${this.command_id}/`, this.parent.url);
    }

    /**
     * @constructor
     * @param { ParentEndpoint } parent
     * @param { Snowflake } command_id
     */
    public constructor(parent: ParentEndpoint, command_id: Snowflake) {
      this.parent = parent;
      this.command_id = command_id;
    }
}

