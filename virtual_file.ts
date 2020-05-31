function concatTypedArrays(a: Uint8Array, b: Uint8Array) { // a, b TypedArray of same type
  var c = new Uint8Array(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}

export interface IVirtualFile
  extends
    Deno.Reader,
    Deno.ReaderSync,
    Deno.Writer,
    Deno.WriterSync,
    Deno.Seeker,
    Deno.SeekerSync,
    Deno.Closer {}

export class VirtualFile implements IVirtualFile {
  #now = new Date();
  public _info: Deno.FileInfo = {
    isFile: true,
    isDirectory: false,
    isSymlink: false,
    size: 0,
    mtime: this.#now,
    atime: this.#now,
    birthtime: this.#now,
    dev: 0,
    mode: 0,
    ino: 0,
    nlink: 0,
    uid: 0,
    gid: 0,
    rdev: 0,
    blksize: 0,
    blocks: 0,
  };
  private _offset = 0; // current off set
  private _closed = false; // is the stream close?
  constructor(public readonly rid: number) {
  }
  _content: Uint8Array = new Uint8Array();
  async write(p: Uint8Array): Promise<number> {
    return this.writeSync(p);
  }
  writeSync(p: Uint8Array): number {
    if (this._closed) {
      return 0;
    }
    this._content = concatTypedArrays(this._content, p);
    this._info.mtime = new Date();
    return p.length;
  }
  async read(p: Uint8Array): Promise<number | null> {
    return this.readSync(p);
  }
  readSync(p: Uint8Array): number | null {
    if (this._closed) {
      return null;
    }
    if (this._offset == this._content.length) {
      return null;
    }
    const len = Math.min(p.length, this._content.length);
    for (let i = 0; i < len; i++) {
      p[i] = this._content[i];
    }
    this._offset += len;
    return len;
  }
  async seek(offset: number, whence: Deno.SeekMode): Promise<number> {
    return 0;
  }
  seekSync(offset: number, whence: Deno.SeekMode): number {
    return 0;
  }
  close(): void {
    this._closed = true;
  }
}
