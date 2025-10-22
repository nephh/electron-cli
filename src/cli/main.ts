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

export async function cli() {
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
            // validate: (value) => {
            //   if (value.length === 0) return "Project name cannot be empty.";
            //   return value;
            // },
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
    },
    {
      onCancel: () => {
        p.cancel(chalk.red("So sad to see you go :("));
        process.exit(0);
      },
    }
  );

  console.log(prompts.projectName, prompts.language);

  return cliResults;
}

cli();
