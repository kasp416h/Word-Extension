import { List } from "@raycast/api";
import { useState, useEffect } from "react";
import DocumentItem from "./DocumentItem";

type DocumentListProps = {
  title: string;
  fetchDocuments: () => Promise<Document[]>;
  sortBy: "created" | "modified";
};

export default function DocumentList({ title, fetchDocuments, sortBy }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetch = async () => {
      const allDocuments = await fetchDocuments();
      setDocuments(allDocuments);
    };
    fetch();
  }, [fetchDocuments]);

  const filteredDocuments = documents
    .filter((document) => document.path.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (sortBy === "created" ? b.timestamp - a.timestamp : b.timestamp - a.timestamp));

  return (
    <List searchBarPlaceholder={`Search ${title}`} onSearchTextChange={setSearchQuery}>
      {filteredDocuments.map((document) => (
        <DocumentItem key={document.path} document={document} />
      ))}
    </List>
  );
}
