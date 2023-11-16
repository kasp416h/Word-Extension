import { exec } from "child_process";
import { showHUD, ActionPanel, List, Icon, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { promises, statSync } from "fs";

interface DocumentInfo {
  timestamp: number;
  path: string;
}

const fetchAllDocuments = async (): Promise<DocumentInfo[]> => {
  try {
    const documentsFromDownloads = await fetchDocumentsInFolder("./Users/kasperhog/Downloads");
    const documentsFromDocuments = await fetchDocumentsInFolder("./Users/kasperhog/Documents");
    const documentsFromOneDrive = await fetchDocumentsInFolder("./Users/kasperhog/OneDrive - Syddansk Erhvervsskole");
    const documentsFromICloud = await fetchDocumentsInFolder(
      "./Users/kasperhog/Library/Mobile Documents/com~apple~CloudDocs",
    );

    const allDocuments = [
      ...documentsFromDownloads,
      ...documentsFromDocuments,
      ...documentsFromOneDrive,
      ...documentsFromICloud,
    ];

    const sortedDocuments = allDocuments.sort((a, b) => b.timestamp - a.timestamp);

    return sortedDocuments;
  } catch (error: any) {
    console.error(`Error fetching documents: ${error.message}`);
    throw new Error("Error fetching documents");
  }
};

const fetchDocumentsInFolder = async (folderPath: string): Promise<DocumentInfo[]> => {
  const documentPaths = await promises.readdir(folderPath);
  const docxFiles = documentPaths.filter((filename) => filename.endsWith(".docx"));

  const documents = await Promise.all(
    docxFiles.map(async (filename) => {
      const path = `${folderPath}/${filename}`;
      const { mtimeMs } = await promises.stat(path);
      return { timestamp: mtimeMs, path } as DocumentInfo;
    }),
  );

  const subfolders = documentPaths.filter((subfolder) => statSync(`${folderPath}/${subfolder}`).isDirectory());

  const subfolderDocuments = await Promise.all(
    subfolders.map(async (subfolder) => fetchDocumentsInFolder(`${folderPath}/${subfolder}`)),
  );

  return documents.concat(...subfolderDocuments);
};

export default function Main() {
  const [documentPaths, setDocumentPaths] = useState<DocumentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 16;

  useEffect(() => {
    fetchAllDocuments().then((allDocuments) => setDocumentPaths(allDocuments.slice(0, limit)));
  }, []);

  const loadMoreDocuments = async () => {
    try {
      const additionalDocuments = await fetchAllDocuments();
      setDocumentPaths((prevDocuments) => [
        ...prevDocuments,
        ...additionalDocuments.slice(prevDocuments.length, prevDocuments.length + limit),
      ]);
    } catch (error) {
      console.error("Error loading more documents:", error);
      showHUD("Error loading more documents");
    }
  };

  const filteredDocuments = documentPaths.filter((document) =>
    document.path.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <List searchBarPlaceholder="Search documents" onSearchTextChange={(text) => setSearchQuery(text)}>
      {filteredDocuments.map((document) => (
        <List.Item
          key={document.path}
          title={`${document.path.split("/").pop() || ""}`}
          subtitle={`Modified: ${new Date(document.timestamp).toLocaleString()}`}
          icon="../assets/word.png"
          actions={
            <ActionPanel>
              <Action
                title="Open in Finder"
                icon={Icon.Finder}
                onAction={() => {
                  exec(`open ${document.path}`);
                }}
              />
            </ActionPanel>
          }
        />
      ))}
      <List.Item
        title="Load More"
        icon={Icon.Repeat}
        actions={
          <ActionPanel>
            <Action title="Load More" icon={Icon.Repeat} onAction={loadMoreDocuments} />
          </ActionPanel>
        }
      />
    </List>
  );
}
