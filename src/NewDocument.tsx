import { showToast, Toast, Form, ActionPanel, Action } from "@raycast/api";
import { exec } from "child_process";

export default function NewDocument() {
  const handleSubmit = () => {
    const script = `
      tell application "Microsoft Word"
        set newDoc to make new document
        set active window of application "Microsoft Word" to window of newDoc
        activate
      end tell
    `;
    exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        console.log(error);
        showToast(Toast.Style.Failure, "Error", "Could not create document.");
      } else {
        showToast(Toast.Style.Success, "Document Created", "A new blank document has been created.");
      }
    });
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Create Document" onAction={handleSubmit} />
        </ActionPanel>
      }
    />
  );
}
