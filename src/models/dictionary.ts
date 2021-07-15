/* eslint-disable no-unused-vars */
/* eslint-disable no-array-constructor */
/* eslint-disable max-len */
/* eslint-disable indent */


/**
 * @class Dict
 */
export class Dictionary<T> implements Iterable<T> {
    /** @constructor */
    public constructor() { }

    /** @method [] - adds value to dict with key */
    [key: string]: T | undefined;

    /**
     * @method Iterator
     * @return { DictionaryIterator<T, TReturn, TNext> }
     */
    [Symbol.iterator](): DictionaryIterator<T, any, undefined> {
        return new DictionaryIterator(Object.getOwnPropertyNames(this), this);
    }
}

/**
 * @class DictionaryIterator
 */
class DictionaryIterator<T, TReturn = any, TNext = undefined> implements Iterator<T> {
    /** @property { Dictionary<T> } dict */
    public dict: Dictionary<T>;

    /** @property { Array<string> } keys */
    public keys: Array<string>;

    /** @property { number } index */
    public index: number;

    /** @property { number } lastIndex */
    public get lastIndex(): number {
        return this.keys.length - 1;
    }

    /**
     * @constructor
     * @param { Array<string> } keys
     * @param { Dictionary<T> } dict
     */
    public constructor(keys: Array<string>, dict: Dictionary<T>) {
        this.keys = keys;
        this.index = 0;
        this.dict = dict;
    }

    /**
     * @method next
     * @param { any[] } value
     * @return { DictionaryIteratorResult<T> }
     */
    next(value?: any): IteratorResult<T, TReturn> {
        const nextValue: IteratorResult<T, any> = {
            value: this.dict[this.keys[this.index]],
            done: this.index == this.lastIndex,
        };
        this.index = this.index++;
        return nextValue;
    }

    /**
     * @method next
     * @param { any } value
     * @return { IteratorResult<T, TReturn> }
     */
    return?(value?: any): IteratorResult<T, TReturn> {
        throw new Error('Method not implemented.');
        const result: IteratorResult<T, TReturn> = {
            done: true,
            value: undefined,
        };
        return result;
    }

    /**
     * @method next
     * @param { any } e
     * @return { DictionaryIteratorResult<T, TReturn> }
     */
    throw?(e?: any): IteratorResult<T, TReturn> {
        throw new Error('Method not implemented.');
        const result: IteratorResult<T, TReturn> = {
            done: true,
            value: undefined,
        };
        return result;
    }
}
