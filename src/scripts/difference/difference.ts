import { existsSync, writeFileSync } from "node:fs";
import { mkdir, readFile, readdir } from "node:fs/promises";
import { dirname } from "node:path";

import { getJsonDifference, getStringDifference } from "./difference.utils";

const OLD_DUMP = "./data/olddump";
const NEW_DUMP = "./data/newdump";

const EXCLUDED_DIRS = ["object_defs", "binary", "interface_defs"];

const differences = async () => {
  const directories = await readdir(OLD_DUMP);

  const queue = [];
  directories.forEach(async (directory) => {
    if (EXCLUDED_DIRS.includes(directory)) {
      return;
    }
    try {
      await directoryDifference(directory);
    } catch (error) {
      queue.push(directory);
    }
  });
};

const directoryDifference = async (directory: string) => {
  console.log(`Checking dir difference: ${directory}`);
  const oldDirectoryContent = await readdir(`${OLD_DUMP}/${directory}`);
  const newDirectoryContent = await readdir(`${NEW_DUMP}/${directory}`);

  oldDirectoryContent
    .filter((content) => !content.includes("."))
    .forEach(async (subdir) => {
      const newExists = existsSync(`${NEW_DUMP}/${directory}/${subdir}`);
      if (newExists) {
        await directoryDifference(`${directory}/${subdir}`);
      } else {
        const subDirContent = await readdir(
          `${OLD_DUMP}/${directory}/${subdir}`
        );
        subDirContent.forEach(async (file) => {
          const fileData = await readFile(
            `${OLD_DUMP}/${directory}/${subdir}/${file}`
          );
          await writeFileDiff(
            "removed",
            `${directory}/${subdir}/${file}`,
            fileData
          );
        });
      }
    });

  newDirectoryContent
    .filter((content) => !content.includes("."))
    .forEach(async (subdir) => {
      const oldExists = existsSync(`${OLD_DUMP}/${directory}/${subdir}`);
      if (oldExists) {
        await directoryDifference(`${directory}/${subdir}`);
      } else {
        const subDirContent = await readdir(
          `${NEW_DUMP}/${directory}/${subdir}`
        );
        subDirContent.forEach(async (file) => {
          const fileData = await readFile(
            `${NEW_DUMP}/${directory}/${subdir}/${file}`
          );
          await writeFileDiff(
            "added",
            `${directory}/${subdir}/${file}`,
            fileData
          );
        });
      }
    });

  const oldFiles = oldDirectoryContent.filter((content) =>
    content.includes(".")
  );
  const newFiles = newDirectoryContent.filter((content) =>
    content.includes(".")
  );

  const added = newFiles.filter((file) => !oldFiles.includes(file));
  let same = newFiles.filter((file) => oldFiles.includes(file));
  same = oldFiles.filter((file) => same.includes(file));
  const removed = oldFiles.filter((file) => !newFiles.includes(file));

  same.forEach(async (file) => {
    try {
      if (file.endsWith(".json")) {
        await saveJsonDifferences(`${directory}/${file}`);
      } else if (file.endsWith(".png")) {
        await writeImageDifferences(
          `${OLD_DUMP}/${directory}/${file}`,
          `${NEW_DUMP}/${directory}/${file}`
        );
      } else {
      }
    } catch (error) {
      console.log(`Failed to diff ${file}`);
    }
  });

  added.forEach(async (file) => {
    const fileData = await readFile(`${NEW_DUMP}/${directory}/${file}`);
    await writeFileDiff("added", `${directory}/${file}`, fileData);
  });

  removed.forEach(async (file) => {
    const fileData = await readFile(`${OLD_DUMP}/${directory}/${file}`);
    await writeFileDiff("removed", `${directory}/${file}`, fileData);
  });
};

const saveJsonDifferences = async (path: string) => {
  try {
    const oldFile = await readFile(`${OLD_DUMP}/${path}`, "utf8");
    const newFile = await readFile(`${NEW_DUMP}/${path}`, "utf8");
    try {
      const oldJson = JSON.parse(oldFile);
      const newJson = JSON.parse(newFile);
      const differentJson = getJsonDifference(oldJson, newJson);
      if (Object.keys(differentJson).length > 0) {
        await writeFileDiff(
          "differences",
          path,
          JSON.stringify(differentJson, null, "\t")
        );
      }
    } catch (e) {
      writeStringDifferences(oldFile, newFile);
    }
  } catch (e) {
    console.log(`Failed to save: ${path}`);
  }
};

const writeStringDifferences = (oldFile: string, newFile: string) => {
  const addedString = getStringDifference(newFile, oldFile);
  const removedString = getStringDifference(oldFile, newFile);
};

const writeImageDifferences = async (
  oldFilePath: string,
  newFilePath: string
) => {
  const oldFile = await readFile(oldFilePath);
  const newFile = await readFile(newFilePath);
  if (oldFile.compare(newFile) !== 0) {
    await writeFileDiff("removed", oldFilePath.replace(OLD_DUMP, ""), oldFile);
    await writeFileDiff("added", newFilePath.replace(NEW_DUMP, ""), newFile);
  }
};

const writeFileDiff = async (
  type: string,
  path: string,
  data: string | Buffer
) => {
  const fullPath = `./out/differences/${type}/${path}`;

  await mkdir(dirname(fullPath), { recursive: true });

  writeFileSync(fullPath, data);
};

export default differences;
