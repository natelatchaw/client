/* eslint-disable no-unused-vars */
/* eslint-disable no-array-constructor */
/* eslint-disable max-len */
/* eslint-disable indent */

/**
 * @class Dict
 */
export class Dictionary<T> implements NodeJS.Dict<T>, Iterable<T> {
    /** @constructor */
    public constructor() { }

    /** @method [] - adds value to dict with key */
    [key: string]: T | undefined;

    /**
     * @method Iterator
     * @return { DictionaryIterator<T, TReturn, TNext> }
     */
    [Symbol.iterator](): DictionaryIterator<T, any, undefined> {
        const keys: Array<string> = Object.getOwnPropertyNames(this);
        const dictionary: Dictionary<T> = this;
        return new DictionaryIterator(keys, dictionary);
    }
}

/**
 * @class DictionaryIterator
 */
class DictionaryIterator<T, TReturn, TNext = T> implements Iterator<T> {
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
        this.index = 0;
        this.keys = keys;
        this.dict = dict;
    }

    /**
     * @method next
     * @param { any[] } value
     * @return { DictionaryIteratorResult<T> }
     */
    next(...args: Array<any> | Array<undefined>): IteratorResult<T, any> {
        const value: T | undefined = this.dict[this.keys[++this.index]];
        if (value) {
            const nextValue: IteratorYieldResult<T> = { done: false, value: value };
            return nextValue;
        }
        else {
            const nextValue: IteratorReturnResult<any> = { done: true, value: value };
            return nextValue;
        }
    }

    /**
     * @method next
     * @param { any } value
     * @return { IteratorResult<T, any> }
     */
    return?(...args: Array<any> | Array<undefined>): IteratorResult<T, any> {
        const result: IteratorReturnResult<any> = { done: true, value: undefined };
        return result;
    }

    /**
     * @method next
     * @param { any } e
     * @return { DictionaryIteratorResult<T, any> }
     */
    throw?(e?: any): IteratorResult<T, any> {
        throw new Error('Method not implemented.');
        const result: IteratorResult<T, any> = {
            done: true,
            value: undefined,
        };
        return result;
    }
}
