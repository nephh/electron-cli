// regex for a valid npm package name
const regex = /^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/;

export function validateProjectName(userInput: string) {
  if (userInput[userInput.length - 1] === "/") {
    userInput = userInput.slice(0, -1);
  }

  const paths = userInput.split("/");
  const packageIndex = paths.findIndex((part) => part.startsWith("@"));
  let projectName = paths[paths.length - 1];
  if (packageIndex !== -1) {
    projectName = paths.slice(packageIndex).join("/");
  }

  if (userInput === "." || userInput === "" || regex.test(projectName ?? "")) {
    return;
  } else {
    return `Project name must only use lowercase alphanumeric characters, 
            -, _, and may include a scope.`;
  }
}
