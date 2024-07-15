import { List } from "@raycast/api";
import { useState, useEffect } from "react";
import { fetchAllDocuments } from "./utils/document";
import { addTagToDocument, removeTagFromDocument, getAllTags } from "./utils/tags";
import DocumentItem from "./components/DocumentItem";

export default function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const allDocuments = await fetchAllDocuments();
      setDocuments(allDocuments);
      const tags = await getAllTags();
      setAllTags(tags);
    };
    fetch();
  }, []);

  const handleTagAdded = (documentPath: string, tag: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => (doc.path === documentPath ? { ...doc, tags: [...doc.tags, tag] } : doc)),
    );
  };

  const handleTagRemoved = (documentPath: string, tag: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => (doc.path === documentPath ? { ...doc, tags: doc.tags.filter((t) => t !== tag) } : doc)),
    );
  };

  const filteredDocuments = documents
    .filter(
      (document) =>
        document.path.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (tagsFilter.length === 0 || tagsFilter.every((tag) => document.tags.includes(tag))),
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  return (
    <List
      searchBarPlaceholder="Search documents"
      onSearchTextChange={setSearchQuery}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Tag"
          storeValue
          onChange={(newValue) => setTagsFilter(newValue ? [newValue] : [])}
        >
          <List.Dropdown.Item title="All" value="" />
          {allTags.map((tag) => (
            <List.Dropdown.Item key={tag} title={tag} value={tag} />
          ))}
        </List.Dropdown>
      }
    >
      {filteredDocuments.map((document) => (
        <DocumentItem
          key={document.path}
          document={document}
          onTagAdded={handleTagAdded}
          onTagRemoved={handleTagRemoved}
        />
      ))}
    </List>
  );
}
