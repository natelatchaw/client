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
     * @property { string } credentials - the credential string used for authentication
     */
    public credentials: string;

    /**
     * @property { OutgoingHttpHeader } value - the header value
     */
    public get value(): OutgoingHttpHeader {
      return [this.type, this.credentials].join(' ');
    }

    /**
     * @constructor
     * @param { string } key - the header key
     * @param { string } type - the authentication type
     * @param { string } credentials - the credentials
     */
    constructor(key: string, type: string, credentials: string) {
      this.key = key;
      this.type = type;
      this.credentials = credentials;
    }
}
