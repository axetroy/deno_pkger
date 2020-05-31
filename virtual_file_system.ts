import { IVirtualFile } from "./virtual_file.ts";

const fileMaps = new Map<string, IVirtualFile>();

export function _loadFile(filepath: string, file: IVirtualFile) {
  fileMaps.set(filepath, file);
}

interface VirtualFileSystem {
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
}

const fileSystem: VirtualFileSystem = {
  async stat(path: string) {
    return fileSystem.statSync(path);
  },
  statSync(path: string) {
    const file = fileMaps.get(path);

    if (!file) {
      throw new Error(`file ${path} doest not exist`);
    }

    // @ts-ignore
    return file._info;
  },
  async readFile(path: string) {
    return fileSystem.readFileSync(path);
  },
  readFileSync(path: string) {
    const file = fileMaps.get(path);

    if (!file) {
      throw new Error(`file ${path} doest not exist`);
    }

    // @ts-ignore
    return file._content;
  },
  async writeFile(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ) {
    return fileSystem.writeFileSync(path, data, options);
  },
  async writeFileSync(
    path: string,
    data: Uint8Array,
    options?: Deno.WriteFileOptions,
  ) {
    const file = fileMaps.get(path);

    if (!file) {
      throw new Error(`file ${path} doest not exist`);
    }

    // @ts-ignore
    file._content = data;
    // @ts-ignore
    file._info.size = data.length;
    // @ts-ignore
    file._info.mtime = new Date();
  },
};

export { fileSystem };
