import {
  assertEquals,
} from "https://deno.land/std@v0.59.0/testing/asserts.ts";
import fs from "../../mod.ts";

const keys = [
  "isFile",
  "isDirectory",
  "isSymlink",
  "size",
];

async function generate() {
  const ps = Deno.run({
    cmd: [
      Deno.execPath(),
      "run",
      "-A",
      "--unstable",
      "./pkger.ts",
      "--name=pkger",
      "--include=./__test__/basic/static",
      "--out=./__test__/basic/dist",
    ],
    stdout: "inherit",
    stderr: "inherit",
  });

  await ps.status();

  ps.close();
}

await generate();

Deno.test({
  name: "basic test",
  fn: async () => {
    await import("./dist/README.md.bundle.ts");

    const [v1, v2] = await Promise.all([
      await fs.stat("/README.md"),
      await Deno.stat("./__test__/basic/static/README.md"),
    ]);

    for (const key of keys) {
      assertEquals(
        // @ts-ignore
        v1[key],
        // @ts-ignore
        v2[key],
        `"${key}" for FileInfo should be same`,
      );
    }

    assertEquals(
      await fs.readFile("/README.md"),
      await Deno.readFile("./__test__/basic/static/README.md"),
    );
  },
});

Deno.test({
  name: "test stat",
  fn: async () => {
    const ps = Deno.run({
      cmd: [
        Deno.execPath(),
        "run",
        "-A",
        "--unstable",
        "--importmap=./import_map.json",
        "./__test__/basic/stat.ts",
        "--include=./__test__/basic/static",
        "--out=./__test__/basic/dist",
      ],
      stdout: "piped",
    });

    const output = new TextDecoder().decode(await Deno.readAll(ps.stdout!))
      .trim();

    await ps.status();

    const fileInfo = JSON.parse(output) as Deno.FileInfo;

    const expected: Deno.FileInfo = {
      isFile: true,
      isDirectory: false,
      isSymlink: false,
      size: 13 + (Deno.build.os === "windows" ? 1 : 0),
      mtime: new Date("2020-05-31T09:25:10.906Z"),
      atime: new Date("2020-05-31T09:28:50.589Z"),
      birthtime: new Date("2020-05-31T09:24:50.303Z"),
      dev: 16777220,
      ino: 4400738686,
      mode: 33188,
      nlink: 1,
      uid: 501,
      gid: 20,
      rdev: 0,
      blksize: 4096,
      blocks: 8,
    };

    for (const key of keys) {
      assertEquals(
        // @ts-ignore
        fileInfo[key],
        // @ts-ignore
        expected[key],
        `"${key}" for FileInfo should be same`,
      );
    }

    ps.stdout?.close();
    ps.close();
  },
});

Deno.test({
  name: "test readfile",
  fn: async () => {
    const ps = Deno.run({
      cmd: [
        Deno.execPath(),
        "run",
        "-A",
        "--unstable",
        "--importmap=./import_map.json",
        "./__test__/basic/readfile.ts",
        "--include=./__test__/basic/static",
        "--out=./__test__/basic/dist",
      ],
      stdout: "piped",
    });

    const output = new TextDecoder().decode(await Deno.readAll(ps.stdout!))
      .trim();

    await ps.status();

    assertEquals(
      output,
      new TextDecoder().decode(
        await Deno.readFile("./__test__/basic/static/README.md"),
      ).trim(),
    );

    ps.stdout?.close();
    ps.close();
  },
});
