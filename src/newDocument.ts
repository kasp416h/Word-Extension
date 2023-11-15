import { spawn } from "child_process";
import { showHUD } from "@raycast/api";

export default async function Main() {
  const applescriptCommand = `
    tell application "Microsoft Word"
      activate
      make new document
    end tell
  `;

  const openCommand = spawn("osascript", ["-e", applescriptCommand]);

  openCommand.on("close", (code) => {
    if (code === 0) {
      console.log("New Word document created and opened successfully");
      showHUD("Document created and opened successfully");
    } else {
      console.error(`Error: AppleScript execution failed with code ${code}`);
      showHUD("Error creating and opening document");
    }
  });

  openCommand.on("error", (err) => {
    console.error(`Error: ${err.message}`);
    showHUD("Error executing command");
  });
}
