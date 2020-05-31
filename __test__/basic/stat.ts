import fs from "../../mod.ts";
import "./dist/README.md.bundle.ts";

const stat = await fs.stat("/README.md");
console.log(JSON.stringify(stat, null, 2));
