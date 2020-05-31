import fs from "../../mod.ts";
import "./dist/README.md.bundle.ts";

const stat = await fs.stat("/index.html");
console.log(stat);
