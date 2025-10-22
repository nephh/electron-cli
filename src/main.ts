import { cli } from "./cli/main.js";

async function main() {
  const cliResults = await cli();
  console.log("CLI Results: ", cliResults);
}

main();
