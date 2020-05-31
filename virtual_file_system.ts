import { VirtualFile, IVirtualFile } from "./virtual_file.ts";

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
}

Deno.remove;

const fileSystem: VirtualFileSystem = {
  async open(path: string, options?: Deno.OpenOptions): Promise<Deno.File> {
    return fileSystem.openSync(path, options);
  },
  // TODO: apply options
  openSync(path: string, options?: Deno.OpenOptions): Deno.File {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    return file._clone();
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

  // TODO: apply options
  async remove(path: string, options?: Deno.RemoveOptions) {
    return fileSystem.removeSync(path, options);
  },
  removeSync(path: string, options?: Deno.RemoveOptions) {
    const file = fileMaps.get(path);

    if (!file) {
      throw Deno.errors.NotFound;
    }

    fileMaps.delete(path);
  },
};

export { fileSystem };
