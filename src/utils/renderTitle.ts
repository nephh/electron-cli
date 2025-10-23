import gradient from "gradient-string";

const volt = `
▀██▀  ▀█▀  ▄▄█▀▀██   ▀██▀      █▀▀██▀▀█ 
 ▀█▄  ▄▀  ▄█▀    ██   ██          ██    
  ██  █   ██      ██  ██          ██    
   ███    ▀█▄     ██  ██          ██    
    █      ▀▀█▄▄▄█▀  ▄██▄▄▄▄▄█   ▄██▄   
`

// colors brought in from vscode poimandres theme
const poimandresTheme = {
  blue: "#add7ff",
  cyan: "#89ddff",
  magenta: "#fae4fc",
  red: "#d0679d",
  yellow: "#fffac2",
};

export function renderTitle() {
  const titleGradient = gradient(Object.values(poimandresTheme));
  console.log(titleGradient.multiline(volt));
}