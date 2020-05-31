import {
  assertEquals,
} from "https://deno.land/std@v0.54.0/testing/asserts.ts";
import fs from "../../mod.ts";

async function generate() {
  const ps = Deno.run({
    cmd: [
      Deno.execPath(),
      "run",
      "-A",
      "--unstable",
      "./pkger.ts",
      "--include=./__test__/basic/static",
      "--out=./__test__/basic/dist",
    ],
    stdout: "inherit",
    stderr: "inherit",
  });

  await ps.status();

  ps.stdout?.close();
  ps.stderr?.close();
  ps.close();
}

Deno.test({
  name: "basic test",
  fn: async () => {
    await generate();

    await import("./dist/README.md.bundle.ts");

    assertEquals(
      await fs.stat("/README.md"),
      await Deno.stat("./__test__/basic/static/README.md"),
    );

    assertEquals(
      await fs.readFile("/README.md"),
      await Deno.readFile("./__test__/basic/static/README.md"),
    );
  },
});
