import fs from "../../mod.ts";
import "./dist/README.md.bundle.ts";

const content = await fs.readFile("/README.md");
console.log(new TextDecoder().decode(content));
