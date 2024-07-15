import path from "path";
import os from "os";
import { promises as fsPromises } from "fs";

const TAGS_FILE_PATH = path.join(os.homedir(), "document_tags.json");

const loadTags = async (): Promise<Record<string, string[]>> => {
  try {
    const data = await fsPromises.readFile(TAGS_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const saveTags = async (tags: Record<string, string[]>) => {
  await fsPromises.writeFile(TAGS_FILE_PATH, JSON.stringify(tags, null, 2));
};

export const getTagsForDocument = async (documentPath: string): Promise<string[]> => {
  const tags = await loadTags();
  return tags[documentPath] || [];
};

export const addTagToDocument = async (documentPath: string, tag: string) => {
  const tags = await loadTags();
  if (!tags[documentPath]) {
    tags[documentPath] = [];
  }
  if (!tags[documentPath].includes(tag)) {
    tags[documentPath].push(tag);
  }
  await saveTags(tags);
};

export const removeTagFromDocument = async (documentPath: string, tag: string) => {
  const tags = await loadTags();
  if (tags[documentPath]) {
    tags[documentPath] = tags[documentPath].filter((t) => t !== tag);
    if (tags[documentPath].length === 0) {
      delete tags[documentPath];
    }
    await saveTags(tags);
  }
};

export const getAllTags = async (): Promise<string[]> => {
  const tags = await loadTags();
  const allTags = new Set<string>();
  for (const docTags of Object.values(tags)) {
    docTags.forEach((tag) => allTags.add(tag));
  }
  return Array.from(allTags);
};

export const attachTagsToDocuments = async (documents: Document[]): Promise<Document[]> => {
  const tags = await loadTags();
  return documents.map((doc) => ({
    ...doc,
    tags: tags[doc.path] || [],
    favorite: (tags[doc.path] || []).includes("Favorite"),
  }));
};
