import { Command } from "commander";
import * as p from "@clack/prompts";
import chalk from "chalk";

const defaults = {
  projectName: "my-electron-app",
  packages: ["react", "tailwind", "eslint"],
  flags: {
    default: false,
  },
};

export function cli() {
  const cliResults = defaults;
  const program = new Command()
    .name("volt")
    .description("Quickly bootstrap your Electron app, without the complexity.")
    .argument(
      "[dir]",
      "Application name and directory to create the project in."
    )
    .option(
      "-y, --default",
      "Use the default options and bypass the CLI prompts.",
      false
    )
    .action((dir) => {
      console.log("Creating project in directory:", dir || defaults.appName);
    })
    .parse(process.argv);

  const options = program.opts();
  console.log(options);
  const cliProjectName = program.args[0] || defaults.projectName;
  if (cliProjectName) {
    cliResults.projectName = cliProjectName;
  }

  cliResults.flags = program.opts();

  if (cliResults.flags.default) {
    console.log("Using default options...");
    return cliResults;
  }

  
}
