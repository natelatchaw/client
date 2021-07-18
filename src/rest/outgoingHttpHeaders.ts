import { OutgoingHttpHeader } from 'http';
import { Dictionary } from '../models/dictionary';

/**
 * @interface OutgoingHttpHeaders
 */
export interface OutgoingHttpHeaders extends Dictionary<OutgoingHttpHeader> { }
