import { VirtualFile } from "./virtual_file.ts";

const fileMaps = new Map<string, VirtualFile>();

export function _loadFile(filepath: string, file: VirtualFile) {
  fileMaps.set(filepath, file);
}

interface VirtualFileSystem {
  open(path: string, options?: Deno.OpenOptions): Promise<Deno.File>;
  openSync(path: string, options?: Deno.OpenOptions): Deno.File;
  stat(path: string): Promise<Deno.FileInfo>;
  statSync(path: string): Deno.FileInfo;
  readFile(path: string): Promise<Uint8Array>;
  readFileSync(path: string): Uint8Array;
  writeFile(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ): Promise<void>;
  writeFileSync(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ): void;
  remove(path: string, options?: Deno.RemoveOptions): Promise<void>;
  removeSync(path: string, options?: Deno.RemoveOptions): void;
  create(path: string): Promise<Deno.File>;
  createSync(path: string): Deno.File;
}

const fileSystem: VirtualFileSystem = {
  async open(path: string, options?: Deno.OpenOptions): Promise<Deno.File> {
    return fileSystem.openSync(path, options);
  },
  // TODO: apply options
  openSync(path: string, options?: Deno.OpenOptions): Deno.File {
    if (options?.write) {
      const file = fileMaps.get(path);

      if (!file) {
        throw Deno.errors.NotFound;
      }

      return file;
    }

    if (options?.create) {
      if (fileMaps.get(path)) {
        throw Deno.errors.AlreadyExists;
      }

      const file = VirtualFile.create();

      fileMaps.set(path, file);

      return file;
    }

    // default it read the file
    {
      const file = fileMaps.get(path);

      if (!file) {
        throw Deno.errors.NotFound;
      }

      // return file._clone();
      return file;
    }
  },
  async stat(path: string) {
    return fileSystem.statSync(path);
  },
  statSync(path: string) {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    return file._info;
  },
  async readFile(path: string) {
    return fileSystem.readFileSync(path);
  },
  readFileSync(path: string) {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    return file._content;
  },
  async writeFile(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ) {
    return fileSystem.writeFileSync(path, data, options);
  },
  writeFileSync(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ) {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    file._content = data;
    file._info.size = data.length;
    file._info.mtime = new Date();
  },
  async remove(path: string, options?: Deno.RemoveOptions) {
    return fileSystem.removeSync(path, options);
  },
  removeSync(path: string, options?: Deno.RemoveOptions) {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    if (options?.recursive) {
      for (const key of fileMaps.keys()) {
        if (key.startsWith(path)) {
          fileMaps.delete(key);
        }
      }
    }

    fileMaps.delete(path);
  },
  async create(path: string) {
    return fileSystem.create(path);
  },
  createSync(path: string) {
    {
      const file = fileMaps.get(path);

      if (file) {
        throw Deno.errors.AlreadyExists;
      }
    }

    const file = VirtualFile.create();

    fileMaps.set(path, file);

    return file;
  },
};

export { fileSystem };
