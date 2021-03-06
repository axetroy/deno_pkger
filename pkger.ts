import * as path from "https://deno.land/std@v0.59.0/path/mod.ts";
import { walk, ensureDir } from "https://deno.land/std@v0.59.0/fs/mod.ts";
import { parse } from "https://deno.land/std@v0.59.0/flags/mod.ts";

export const version = "v0.1.0";
export let name = false;

export async function generateBundle(dir: string, outDir: string) {
  dir = path.isAbsolute(dir) ? dir : path.join(Deno.cwd(), dir);
  outDir = path.isAbsolute(outDir) ? outDir : path.join(Deno.cwd(), outDir);

  await ensureDir(outDir);
  for await (const fileInfo of walk(dir)) {
    if (dir === fileInfo.path) {
      continue;
    }

    if (fileInfo.isDirectory) {
      continue;
    }

    if (fileInfo.path.endsWith(".bundle.ts")) {
      continue;
    }

    const file = await Deno.stat(fileInfo.path);

    if (!file) {
      return;
    }

    const buff = await Deno.readFile(fileInfo.path);

    const arr = Array.from(buff);

    function getInfo() {
      const keys = Object.keys(file);
      const values = [];
      for (const key of keys) {
        // @ts-ignore
        let value: unknown = file[key];
        if (value instanceof Date) {
          value = `new Date('${value.toISOString()}')`;
        }
        values.push(`${key}: ${value}`);
      }

      return values;
    }

    const fileName = fileInfo.path.replace(dir, "");

    const targetFile = path.join(outDir, fileName + ".bundle.ts");

    const module = name
      ? name
      : `https://denopkg.com/axetroy/deno_pkger@${version}/mod.ts`;

    const content = `// Generate by https://github.com/axetroy/deno_pkger
// DO NOT MODIFY IT
import { VirtualFile, _loadFile } from "${module}";

const file = new VirtualFile(0)

await file.write(new Uint8Array([${arr}]))

file._info = {
${
      getInfo()
        .map((v) => "  " + v)
        .join(",\n")
    }
};

_loadFile("${fileName.replace(/\\/g, "/")}", file)
`;

    await ensureDir(path.dirname(targetFile));

    await Deno.writeFile(targetFile, new TextEncoder().encode(content), {
      create: true,
    });
  }
}

function printHelpInformation() {
  console.log(`Deno General Resources Packager

Usage:
  pkger --include=./input_dir out=./output_dir

Options:
  --include         Directory of files to be bundle
  --out             Output directory
  --name            Specify the generated file, the name of the module to be imported
  --help,-h         Print help information
  --version,-v      Output version
`);

  Deno.exit(1);
}

if (import.meta.main) {
  const flags = parse(Deno.args);

  if (flags.name) {
    name = flags.name;
  }

  if (flags.h || flags.help) {
    printHelpInformation();
  }

  if (flags.v || flags.version) {
    console.log(version);
    Deno.exit(0);
  }

  if (!flags.include || !flags.out) {
    printHelpInformation();
  }

  await generateBundle(flags.include, flags.out);
}
