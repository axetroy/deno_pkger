import {
  assertEquals,
  assertStrictEq,
  assert,
} from "https://deno.land/std@v0.54.0/testing/asserts.ts";
import { StringReader } from "https://deno.land/std@v0.54.0/io/readers.ts";

import { VirtualFile } from "./virtual_file.ts";

Deno.test({
  name: "empty file",
  fn: async () => {
    const file = new VirtualFile(0);

    assertEquals(file._content, new Uint8Array());
    assertEquals(file._content.length, 0);

    assertStrictEq(await file.read(new Uint8Array()), null);

    const beforeUpdate = file._info.mtime as Date;

    assertStrictEq(
      await file.write(new TextEncoder().encode("hello world")),
      "hello world".length,
    );

    assertStrictEq(
      new TextDecoder().decode(file._content),
      "hello world",
    );

    const afterUpdate = file._info.mtime as Date;

    assert(
      afterUpdate >= beforeUpdate,
      `mtime should be update but got "${beforeUpdate}" : "${afterUpdate}"`,
    );
  },
});

Deno.test({
  name: "test file reader",
  fn: async () => {
    const file = new VirtualFile(0);

    const fileContent = `
Hello world!

This is a super long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long text

Just for test
`;

    file._content = new TextEncoder().encode(fileContent);

    await Deno.copy(file, Deno.stdout);
  },
});

Deno.test({
  name: "test file writer",
  fn: async () => {
    const file = new VirtualFile(0);

    const fileContent = `
Hello world!

This is a super long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long_long text

Just for test
`;

    await Deno.copy(new StringReader(fileContent), file);

    assertEquals(file._content, new TextEncoder().encode(fileContent));
  },
});
