import { OutgoingHttpHeader } from 'http';

/**
 * @class OutgoingHttpHeaderPair
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#syntax
 */
export class OutgoingHttpHeaderPair {
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
    constructor(key: string, type: string, credentials: string | undefined) {
      this.key = key;
      this.type = type;
      this.credentials = credentials;
    }

    /**
     * @static
     * @param { string } key
     * @param { OutgoingHttpHeader } header
     * @return { OutgoingHttpHeaderPair }
     */
    public static generate(key: string, header: OutgoingHttpHeader): OutgoingHttpHeaderPair {
      const typeCredentialPair: Array<string> = header.toString().split(' ', 2);
      const type: string = typeCredentialPair[0];
      const credential: string = typeCredentialPair[1];
      return new OutgoingHttpHeaderPair(key, type, credential);
    }
}
