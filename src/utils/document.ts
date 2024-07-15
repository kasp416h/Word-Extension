import { exec } from "child_process";
import path from "path";
import os from "os";
import { promises as fsPromises } from "fs";

const PATHS_FILE_PATH = path.join(os.homedir(), "document_paths.json");

const getDefaultPaths = () => [
  path.join(os.homedir(), "Downloads"),
  path.join(os.homedir(), "Documents"),
  path.join(os.homedir(), "Library", "Mobile Documents", "com~apple~CloudDocs"),
];

export const loadPaths = async (): Promise<{ defaultPaths: string[]; userPaths: string[] }> => {
  try {
    const data = await fsPromises.readFile(PATHS_FILE_PATH, "utf8");
    const config = JSON.parse(data);
    return {
      defaultPaths: getDefaultPaths(),
      userPaths: config.userPaths || [],
    };
  } catch (error) {
    return {
      defaultPaths: getDefaultPaths(),
      userPaths: [],
    };
  }
};

export const savePaths = async (userPaths: string[]) => {
  const config = { userPaths };
  await fsPromises.writeFile(PATHS_FILE_PATH, JSON.stringify(config, null, 2));
};

export const addPath = async (newPath: string) => {
  const { userPaths } = await loadPaths();
  if (!userPaths.includes(newPath)) {
    userPaths.push(newPath);
    await savePaths(userPaths);
  }
};

export const removePath = async (removePath: string) => {
  const { userPaths } = await loadPaths();
  const updatedUserPaths = userPaths.filter((path) => path !== removePath);
  await savePaths(updatedUserPaths);
};

export const fetchDocumentsInFolder = async (folderPath: string): Promise<Document[]> => {
  try {
    const documentPaths = await fsPromises.readdir(folderPath, { withFileTypes: true });
    const docxFiles = documentPaths
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".docx") && !dirent.name.startsWith("~$"))
      .map((dirent) => dirent.name);

    const documents = await Promise.all(
      docxFiles.map(async (filename) => {
        const filePath = path.join(folderPath, filename);
        const stats = await fsPromises.stat(filePath);
        return { timestamp: stats.mtimeMs, path: filePath, favorite: false, tags: [] };
      }),
    );

    const subfolderDocuments = (
      await Promise.all(
        documentPaths
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => fetchDocumentsInFolder(path.join(folderPath, dirent.name))),
      )
    ).flat();

    return [...documents, ...subfolderDocuments];
  } catch (error) {
    console.error(`Error fetching documents in ${folderPath}: ${error}`);
    return [];
  }
};

export const fetchAllDocuments = async (): Promise<Document[]> => {
  const { defaultPaths, userPaths } = await loadPaths();
  const allPaths = [...defaultPaths, ...userPaths];
  const documents = (await Promise.all(allPaths.map(fetchDocumentsInFolder))).flat();
  return documents.sort((a, b) => b.timestamp - a.timestamp);
};
