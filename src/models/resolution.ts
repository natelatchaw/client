/**
 * @type Resolution
 * @summary
 * Represents the resolve callback event type.
 */
export type Resolution<T> = (value: T | Promise<T>) => void;
