import { Snowflake } from 'discord-models';

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
   * @return { OAuthEndpoint }
   */
  public oauth(): OAuthEndpoint<DiscordEndpoint> {
    return new OAuthEndpoint(this);
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
export class OAuthEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
  /**
   * @property { ParentEndpoint } parent
   */
  public parent: ParentEndpoint;

  /**
     * @property { URL } url
     */
  public get url(): URL {
    return new URL(`oauth2/`, this.parent.url);
  }

  /**
   * @constructor
   * @param { ParentEndpoint } parent
   * @param { number } version
   */
  public constructor(parent: ParentEndpoint) {
    this.parent = parent;
  }

  /**
   * @param { Snowflake } client_id
   * @param { number } permissions
   * @param { string | undefined } scope
   * @param { Snowflake | undefined } guild_id
   * @param { boolean | undefined } disable_guild_select
   * @return { AuthorizeEndpoint }
   */
  public authorize(
      client_id: Snowflake,
      permissions: number,
      scope?: string,
      guild_id?: Snowflake,
      disable_guild_select?: boolean,
  ): AuthorizeEndpoint<OAuthEndpoint<ParentEndpoint>> {
    return new AuthorizeEndpoint(this, client_id, permissions, scope, guild_id, disable_guild_select);
  }

  /**
   * @return { ApplicationEndpoint }
   */
  public applications(): ApplicationEndpoint<OAuthEndpoint<ParentEndpoint>> {
    return new ApplicationEndpoint(this, '@me');
  }
}

/**
 * @class
 */
export class AuthorizeEndpoint<ParentEndpoint extends APIEndpoint> implements APIEndpoint {
  /**
   * @property { ParentEndpoint } parent
   */
  public parent: ParentEndpoint;

  /**
   * @property { Snowflake } client_id - the application's snowflake id
   */
  public client_id: Snowflake;

  /**
   * @property { string } scope
   */
  public scope: string;

  /**
   * @property { number } permissions
   */
  public permissions: number;

  /**
   * @property { Snowflake | undefined } guild_id
   */
  public guild_id?: Snowflake;

  /**
   * @property { boolean } disable_guild_select
   */
  public disable_guild_select: boolean;

  /**
   * @property { URL } url
   */
  public get url(): URL {
    const url: URL = new URL(`authorize`, this.parent.url);
    url.searchParams.append('client_id', this.client_id.toString());
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('permissions', this.permissions.toString());
    if (this.guild_id) url.searchParams.append('guild_id', this.guild_id.toString());
    url.searchParams.append('disable_guild_select', JSON.stringify(this.disable_guild_select));
    return url;
  }

  /**
   * @constructor
   * @param { ParentEndpoint } parent
   * @param { Snowflake } client_id
   * @param { number } permissions
   * @param { string } scope
   * @param { Snowflake } guild_id
   * @param { boolean } disable_guild_select
   */
  public constructor(
      parent: ParentEndpoint,
      client_id: Snowflake,
      permissions: number,
      scope: string = 'bot',
      guild_id?: Snowflake,
      disable_guild_select: boolean = false,
  ) {
    this.parent = parent;
    this.client_id = client_id;
    this.permissions = permissions;
    this.scope = scope;
    this.guild_id = guild_id;
    this.disable_guild_select = disable_guild_select;
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
    return new URL(`v${this.version}`, this.parent.url);
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

