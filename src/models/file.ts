/* eslint-disable object-curly-spacing */
/* eslint-disable brace-style */
/* eslint-disable max-len */
import * as fs from 'fs';
import { PathLike, promises } from 'fs';
import { promisify } from 'util';

/**
 * Describes a reference to a file on disk. Provides methods
 * for manipulating and altering the referenced file.
 */
export class File {
    /**
     * @property {PathLike} path: The path of the file
     */
    private path: PathLike

    /**
     * @property {Promise<promises.FileHandle>}: A reference to the file used for operations
     */
    private handleRequest?: Promise<promises.FileHandle>

    /**
     * @param {PathLike} path
     */
    constructor(path: PathLike) {
      this.path = path;
    }

    /**
     * @param {string} flags
     * @return {Promise<promises.FileHandle>}
     */
    public async open(flags: string = 'wx+'): Promise<promises.FileHandle> {
      try {
        // get a file handle for reading and appending
        this.handleRequest = promises.open(this.path, flags);
        return this.handleRequest;
      }
      catch (error: any) {
        throw error;
      }
    }

    /**
     * @return {Promise<void>}: A promise of the task's completion
     */
    public async close(): Promise<void> {
      try {
        // wait for the promise to complete
        const handle = await this.handleRequest;
        // if the handle's value is undefined
        if (!handle) throw new Error('File handle is invalid.');
        // close the file
        return handle.close();
      }
      catch (error: any) {
        // rethrow error
        throw error;
      }
    }

    /**
     * @return {Promise<void>}: A promise of the task's completion
     */
    public async delete(): Promise<void> {
      try {
        // wait for the promise to complete
        const handle = await this.handleRequest;
        // if the handle's value is undefined
        if (!handle) throw new Error('File handle is invalid.');
        // convert fs.unlink as callback-based function to promise-based function
        const unlink: ((path: PathLike) => Promise<void>) = promisify(fs.unlink);
        return unlink(this.path);
      }
      catch (error: any) {
        // rethrow error
        throw error;
      }
    }

    /**
     * @param { string } data
     */
    public async write(data: string) {
      // create buffer from stringified data
      const buffer: Buffer = Buffer.from(data);
      // open the file
      const handle: promises.FileHandle = await this.open('w+');
      // write the buffer to file
      await handle.write(buffer, 0, buffer.length, 0);
      // close file when done
      await handle.close();
    }
}
