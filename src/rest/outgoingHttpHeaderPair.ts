import { OutgoingHttpHeader } from 'http';

/**
 * @interface OutgoingHttpHeaderPair
 */
export interface OutgoingHttpHeaderPair {
  /**
   * @property { string } key - the header key
   */
  key: string;

  /**
   * @property { OutgoingHttpHeader } value - the header value
   */
  value: OutgoingHttpHeader;
}

/**
 * @class OutgoingHttpBasicHeaderPair
 */
export class OutgoingHttpBasicHeaderPair implements OutgoingHttpHeaderPair {
  /**
   * @property { string } key - the header key
   */
  public key: string;

  /**
   * @property { OutgoingHttpHeader } value - the header value
   */
  public value: OutgoingHttpHeader;

  /**
   * @constructor
   * @param { string } key
   * @param { OutgoingHttpHeader } value
   */
  public constructor(
      key: string,
      value: OutgoingHttpHeader,
  ) {
    this.key = key;
    this.value = value;
  }
}

/**
 * @class OutgoingHttpAuthorizationHeaderPair
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#syntax
 */
export class OutgoingHttpAuthorizationHeaderPair implements OutgoingHttpHeaderPair {
  /**
   * @property { string } key - the header key
   */
  public key: string;

  /**
   * @property { string } type - the authentication type
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
   */
  public type: string;

  /**
   * @property { string | undefined } credentials - the credential string used for authentication
   */
  public credentials?: string;

  /**
   * @property { OutgoingHttpHeader } value - the header value
   */
  public get value(): OutgoingHttpHeader {
    if (this.credentials) return [this.type, this.credentials].join(' ');
    else return this.type;
  }

  /**
   * @constructor
   * @param { string } key - the header key
   * @param { string } type - the authentication type
   * @param { string | undefined } credentials - the credentials
   */
  constructor(
      key: string,
      type: string,
      credentials: string | undefined,
  ) {
    this.key = key;
    this.type = type;
    this.credentials = credentials;
  }

  /**
   * @static
   * @param { string } key
   * @param { OutgoingHttpHeader } header
   * @return { OutgoingHttpAuthorizationHeaderPair }
   */
  public static generate(key: string, header: OutgoingHttpHeader): OutgoingHttpAuthorizationHeaderPair {
    const typeCredentialPair: Array<string> = header.toString().split(' ', 2);
    const type: string = typeCredentialPair[0];
    const credential: string = typeCredentialPair[1];
    return new OutgoingHttpAuthorizationHeaderPair(key, type, credential);
  }
}
