import { ActionPanel, List, Action, Icon } from "@raycast/api";
import path from "path";
import { exec } from "child_process";
import { useState } from "react";

type DocumentItemProps = {
  document: Document;
  onTagAdded: (documentPath: string, tag: string) => void;
  onTagRemoved: (documentPath: string, tag: string) => void;
};

export default function DocumentItem({ document }: DocumentItemProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  return (
    <List.Item
      key={document.path}
      title={path.basename(document.path)}
      subtitle={`Modified: ${new Date(document.timestamp).toLocaleString()}`}
      icon={document.favorite ? Icon.Star : "../assets/word.png"}
      actions={
        <ActionPanel>
          <Action title="Open in Finder" icon={Icon.Finder} onAction={() => exec(`open "${document.path}"`)} />
        </ActionPanel>
      }
    />
  );
}
