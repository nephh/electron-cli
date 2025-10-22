import { Command } from "commander";
import * as p from "@clack/prompts";
import chalk from "chalk";
import { validateProjectName } from "../utils/validateProjectName.js";

interface CLIResults {
  projectName: string;
  packages: string[];
  flags: {
    default: boolean;
  };
}

const defaults: CLIResults = {
  projectName: "my-electron-app",
  packages: ["tailwind", "eslint"],
  flags: {
    default: false,
  },
};

export async function cli(): Promise<CLIResults> {
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
      console.log(
        "Creating project in directory: ",
        dir || defaults.projectName
      );
    })
    .version("0.1.0", "-v, --version", "Show the current version")
    .addHelpText(
      "after",
      `This project is inspired by Vite and ${chalk.magenta("Create-T3-App")}. I hope you enjoy using it!`
    )
    .parse(process.argv);

  const cliProjectName = program.args[0];

  if (cliProjectName) {
    cliResults.projectName = cliProjectName;
  }

  cliResults.flags = program.opts();

  if (cliResults.flags.default) {
    console.log(chalk.italic("Using default options..."));
    return cliResults;
  }

  const prompts = await p.group(
    {
      ...(!cliProjectName && {
        projectName: () =>
          p.text({
            message: "What would you like to name your project?",
            placeholder: defaults.projectName,
            defaultValue: defaults.projectName,
            validate: validateProjectName,
          }),
      }),
      language: () => {
        return p.select({
          message: "Will you be using TypeScript or JavaScript?",
          options: [
            { value: "typescript", label: "TypeScript" },
            { value: "javascript", label: "JavaScript" },
          ],
          initialValue: "typescript",
        });
      },
      tailwind: () => {
        return p.confirm({
          message: "Would you like to include Tailwind CSS?",
          initialValue: true,
        });
      },
      eslint: () => {
        return p.confirm({
          message: "Would you like to include ESLint?",
          initialValue: true,
        });
      },
    },
    {
      onCancel: () => {
        p.cancel(chalk.red("So sad to see you go :("));
        process.exit(0);
      },
    }
  );

  const packages = [];
  if (prompts.tailwind) packages.push("tailwind");
  if (prompts.eslint) packages.push("eslint");

  return {
    projectName: prompts.projectName || cliResults.projectName,
    packages,
    flags: cliResults.flags,
  };
}
