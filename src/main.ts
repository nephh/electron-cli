import { renderTitle } from "~/utils/renderTitle.js";
import { cli } from "./cli/main.js";

async function main() {
  renderTitle();
  const cliResults = await cli();
  console.log("CLI Results: ", cliResults);
}

main();
