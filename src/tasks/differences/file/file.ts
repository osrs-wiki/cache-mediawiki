import { indexMap } from "./file.utils";
import { IndexType } from "../../../utils/cache2";
import { CompareFn, FileDifferences } from "../differences.types";

/**
 * Retrieve the file differences between two given files.
 * @params
 * @returns The differences between two files.
 *  If either is undefined the difference will be considered additions or removals.
 */
const differencesFile: CompareFn = async ({
  oldFile,
  newFile,
}): Promise<FileDifferences> => {
  const indexId = oldFile?.index?.id ?? newFile?.index?.id;
  let comparisonFn = indexMap[indexId as IndexType];
  let results: FileDifferences = {};
  if (typeof comparisonFn === "function") {
    results = await comparisonFn({ oldFile, newFile });
  } else {
    const archiveId = oldFile?.archive?.archive ?? newFile?.archive?.archive;
    comparisonFn = comparisonFn?.[archiveId];
    try {
      results = (await comparisonFn?.({ oldFile, newFile })) ?? {};
    } catch (error) {
      console.error(
        `Error decoding [index=${indexId}][archive=${archiveId}][file=${newFile.file.id}]`,
        error
      );
    }
  }
  return results;
};

export default differencesFile;
